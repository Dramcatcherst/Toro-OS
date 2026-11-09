import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function config(env) {
  const required = ["PORTAL_QA_URL", "PORTAL_QA_SHA", "PORTAL_QA_SESSION_FILE", "PORTAL_QA_APPROVED_ORIGIN"];
  if (required.some(key => !env[key])) throw new Error("QA_BLOCKED_CONFIGURATION");
  const url = new URL(env.PORTAL_QA_URL);
  const origin = new URL(env.PORTAL_QA_APPROVED_ORIGIN);
  if (url.protocol !== "https:" || url.origin !== origin.href.replace(/\/$/, "") ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/portal") {
    throw new Error("QA_BLOCKED_TARGET");
  }
  if (!/^[a-f0-9]{40}$/.test(env.PORTAL_QA_SHA)) throw new Error("QA_BLOCKED_SHA");
  return { url: url.href, sha: env.PORTAL_QA_SHA, sessionFile: env.PORTAL_QA_SESSION_FILE };
}

export async function run(env = process.env) {
  const target = config(env);
  // Session bytes are private input, never logged or exported as evidence.
  const state = JSON.parse(await readFile(target.sessionFile, "utf8"));
  assert(Array.isArray(state.cookies), "QA_BLOCKED_SESSION_FORMAT");
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
    const context = await browser.newContext({ storageState: state });
    // Never permit the harness to write business data or contact another origin.
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
    await page.goto(target.url, { waitUntil: "networkidle" });
    assert.equal(new URL(page.url()).origin, new URL(target.url).origin, "QA_BLOCKED_LOGIN_OR_REDIRECT");
    assert.equal(new URL(page.url()).pathname, "/portal", "QA_BLOCKED_LOGIN_OR_REDIRECT");
    const response = await context.request.get(new URL("/api/brain/context", target.url).href);
    assert.equal(response.status(), 200, "QA_BLOCKED_ORGANIZATION_SESSION");
    const actor = await response.json();
    assert.equal(actor.state, "resolved", "QA_BLOCKED_CONTEXT");
    assert.equal(actor.authenticatedContext, true, "QA_BLOCKED_CONTEXT");
    assert.equal(actor.organizationDataAllowed, true, "QA_BLOCKED_CONTEXT");
    evidence.authenticatedOrganizationContext = true;
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
    assert.equal(runtimeErrors, 0, "QA_RUNTIME_ERRORS");
    // Output only non-sensitive counts/flags; never page text, URLs, cookies or screenshots.
    const output = env.PORTAL_QA_RESULT_DIR || "/tmp/toro-portal-qa";
    await mkdir(output, { recursive: true, mode: 0o700 });
    await writeFile(output + "/result.json", JSON.stringify(evidence, null, 2), { mode: 0o600 });
    await context.close();
    return evidence;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().then(() => console.log("QA_PARTIAL_CHECKS_COMPLETED_NOT_RELEASE_ACCEPTANCE"))
    .catch(() => { console.error("QA_BLOCKED_OR_FAILED: inspect authorized configuration and private runner"); process.exitCode = 1; });
}
