import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { openAuthorizedSession } from "./portal-cloud-session.mjs";

const failureCodes = Object.freeze({
  configuration: "QA_CONFIGURATION_FAILED",
  session_input: "QA_SESSION_INPUT_FAILED",
  browser_start: "QA_BROWSER_START_FAILED",
  browser_context: "QA_BROWSER_CONTEXT_FAILED",
  vercel_auth: "QA_VERCEL_AUTH_FAILED",
  login: "QA_LOGIN_FAILED",
  login_transport: "QA_LOGIN_TRANSPORT_FAILED",
  login_response: "QA_LOGIN_RESPONSE_FAILED",
  login_http_400: "QA_LOGIN_HTTP_400",
  login_http_401: "QA_LOGIN_HTTP_401",
  login_http_401_unattributed: "QA_LOGIN_HTTP_401_UNATTRIBUTED",
  login_toro_denial_compatible: "QA_LOGIN_TORO_DENIAL_COMPATIBLE",
  login_http_403: "QA_LOGIN_HTTP_403",
  login_http_404: "QA_LOGIN_HTTP_404",
  login_http_429: "QA_LOGIN_HTTP_429",
  login_http_503: "QA_LOGIN_HTTP_503",
  login_http_other: "QA_LOGIN_HTTP_OTHER",
  login_pv00: "QA_LOGIN_PV00",
  login_pv01: "QA_LOGIN_PV01",
  login_pv02: "QA_LOGIN_PV02",
  login_pv03: "QA_LOGIN_PV03",
  login_pv04: "QA_LOGIN_PV04",
  login_pv05: "QA_LOGIN_PV05",
  login_pv06: "QA_LOGIN_PV06",
  login_pv07: "QA_LOGIN_PV07",
  login_pv08: "QA_LOGIN_PV08",
  request_guard: "QA_REQUEST_GUARD_FAILED",
  portal_navigation: "QA_PORTAL_NAVIGATION_FAILED",
  organization_context: "QA_ORGANIZATION_CONTEXT_FAILED",
  responsive_keyboard: "QA_RESPONSIVE_KEYBOARD_FAILED",
  runtime: "QA_RUNTIME_FAILED",
  receipt: "QA_RECEIPT_FAILED",
  browser_close: "QA_BROWSER_CLOSE_FAILED",
});

// Only internal stage constants are emitted. Never inspect the thrown error.
export function failureDiagnostic(stage) {
  if (typeof stage !== "string" || !Object.hasOwn(failureCodes, stage)) {
    return "QA_BLOCKED_OR_FAILED stage=unknown code=QA_UNEXPECTED_FAILURE";
  }
  return `QA_BLOCKED_OR_FAILED stage=${stage} code=${failureCodes[stage]}`;
}

export function config(env) {
  const required = ["PORTAL_QA_URL", "PORTAL_QA_SHA", "PORTAL_QA_APPROVED_ORIGIN"];
  if (required.some(key => !env[key])) throw new Error("QA_BLOCKED_CONFIGURATION");
  if (!env.PORTAL_QA_SESSION_FILE && !(env.PORTAL_QA_IDENTIFIER && env.PORTAL_QA_PASSWORD)) throw new Error("QA_BLOCKED_CONFIGURATION");
  if (env.PORTAL_QA_SESSION_FILE && (env.PORTAL_QA_IDENTIFIER || env.PORTAL_QA_PASSWORD)) throw new Error("QA_BLOCKED_AMBIGUOUS_AUTH");
  const url = new URL(env.PORTAL_QA_URL);
  const origin = new URL(env.PORTAL_QA_APPROVED_ORIGIN);
  if (url.protocol !== "https:" || url.origin !== origin.href.replace(/\/$/, "") ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/portal") {
    throw new Error("QA_BLOCKED_TARGET");
  }
  if (!/^[a-f0-9]{40}$/.test(env.PORTAL_QA_SHA)) throw new Error("QA_BLOCKED_SHA");
  return { url: url.href, sha: env.PORTAL_QA_SHA, sessionFile: env.PORTAL_QA_SESSION_FILE || null };
}

export async function run(env = process.env, onStage = () => {}) {
  onStage("configuration");
  const target = config(env);
  // Session bytes are private input, never logged or exported as evidence.
  onStage("session_input");
  const state = target.sessionFile ? JSON.parse(await readFile(target.sessionFile, "utf8")) : { cookies: [], origins: [] };
  assert(Array.isArray(state.cookies), "QA_BLOCKED_SESSION_FORMAT");
  onStage("browser_start");
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const evidence = {
    schema: 1, candidateSha: target.sha,
    shaBinding: "EXTERNAL_VERCEL_METADATA_REVALIDATION_REQUIRED",
    authenticatedOrganizationContext: false, widths: [],
    roleAndExactOrganization: "NOT_VERIFIED",
    fullBatchCountCorrectness: "NOT_VERIFIED",
    visualReview: "NOT_ACCEPTED", releaseAcceptance: "NOT_GRANTED",
  };
  try {
    // No trace/video/HAR: they could disclose the account's data or credentials.
    onStage("browser_context");
    const context = await browser.newContext({ storageState: state });
    await openAuthorizedSession(context, target, env, onStage);
    // Never permit the harness to write business data or contact another origin.
    onStage("request_guard");
    await context.route("**/*", route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== new URL(target.url).origin ||
          !["GET", "HEAD"].includes(request.method())) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    let runtimeErrors = 0;
    page.on("pageerror", () => { runtimeErrors += 1; });
    onStage("portal_navigation");
    await page.goto(target.url, { waitUntil: "networkidle" });
    assert.equal(new URL(page.url()).origin, new URL(target.url).origin, "QA_BLOCKED_LOGIN_OR_REDIRECT");
    assert.equal(new URL(page.url()).pathname, "/portal", "QA_BLOCKED_LOGIN_OR_REDIRECT");
    onStage("organization_context");
    const response = await context.request.get(new URL("/api/brain/context", target.url).href, { maxRedirects: 0 });
    assert.equal(response.status(), 200, "QA_BLOCKED_ORGANIZATION_SESSION");
    const actor = await response.json();
    assert.equal(actor.state, "resolved", "QA_BLOCKED_CONTEXT");
    assert.equal(actor.authenticatedContext, true, "QA_BLOCKED_CONTEXT");
    assert.equal(actor.organizationDataAllowed, true, "QA_BLOCKED_CONTEXT");
    evidence.authenticatedOrganizationContext = true;
    onStage("responsive_keyboard");
    for (const width of [320, 390, 412, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const tabs = page.getByRole("tablist", { name: "Vistas del Portal" });
      const home = tabs.getByRole("tab", { name: "Inicio", exact: true });
      const operations = tabs.getByRole("tab", { name: "Operación", exact: true });
      await home.click();
      await page.getByRole("heading", { name: "Hoy · trabajo registrado", exact: true }).waitFor();
      await operations.focus();
      await page.keyboard.press("Enter");
      assert.equal(await operations.getAttribute("aria-selected"), "true", "QA_KEYBOARD_ACTIVATION");
      const panel = page.getByRole("region", { name: "Operación · Dreamcatcher", exact: true });
      await panel.waitFor();
      const visibleTasks = await panel.locator("ol > li").count();
      assert(visibleTasks <= 12, "QA_TASK_LIMIT");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, "QA_HORIZONTAL_OVERFLOW");
      await home.focus();
      await page.keyboard.press("Enter");
      assert.equal(await home.getAttribute("aria-selected"), "true", "QA_KEYBOARD_RETURN");
      evidence.widths.push({ width, visibleTasks, horizontalOverflow: false, tabKeyboardRoundTrip: true });
    }
    onStage("runtime");
    assert.equal(runtimeErrors, 0, "QA_RUNTIME_ERRORS");
    // Output only non-sensitive counts/flags; never page text, URLs, cookies or screenshots.
    const output = env.PORTAL_QA_RESULT_DIR || "/tmp/toro-portal-qa";
    onStage("receipt");
    await mkdir(output, { recursive: true, mode: 0o700 });
    await writeFile(output + "/result.json", JSON.stringify(evidence, null, 2), { mode: 0o600 });
    onStage("browser_close");
    await context.close();
    return evidence;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let stage = "configuration";
  run(process.env, value => { stage = value; }).then(() => console.log("QA_PARTIAL_CHECKS_COMPLETED_NOT_RELEASE_ACCEPTANCE"))
    .catch(() => { console.error(failureDiagnostic(stage)); process.exitCode = 1; });
}
