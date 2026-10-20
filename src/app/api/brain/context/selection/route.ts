import { NextResponse } from "next/server";

import {
  parseToroOrganizationId,
  serializeToroOrganizationPreference,
  toroOrganizationCookieOptions,
  TORO_ACTIVE_ORGANIZATION_COOKIE,
} from "@/features/context/organization-selection";
import { resolveToroContext } from "@/features/context/resolver";
import { isPortalDeployment } from "@/lib/server/public-demo";

const MAXIMUM_BODY_BYTES = 512;
const FORM_MEDIA_TYPE = "application/x-www-form-urlencoded";

type ContextSelectionInput =
  | { intent: "clear" }
  | { intent: "select"; organizationId: string };

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function boundaryFailure(status: 403 | 404 | 413) {
  return privateResponse(NextResponse.json(
    { state: "context_selection_unavailable" },
    { status },
  ));
}

function redirectWithPreference(
  request: Request,
  path: "/my-toro" | "/my-toro?context=invalid" | "/login?next=/my-toro",
  preferenceValue: string | null,
) {
  const response = privateResponse(NextResponse.redirect(new URL(path, request.url), 303));
  const options = toroOrganizationCookieOptions(request.url);
  if (preferenceValue) {
    // No Max-Age or Expires: the selected scope is intentionally session-only.
    response.cookies.set(TORO_ACTIVE_ORGANIZATION_COOKIE, preferenceValue, options);
  } else {
    response.cookies.set(TORO_ACTIVE_ORGANIZATION_COOKIE, "", { ...options, maxAge: 0 });
  }
  return response;
}

async function limitedText(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const parsedLength = Number(contentLength);
    if (!Number.isInteger(parsedLength) || parsedLength < 0 || parsedLength > MAXIMUM_BODY_BYTES) {
      throw new Error("invalid_content_length");
    }
  }
  if (!request.body) throw new Error("missing_body");

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let result = "";
  let size = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAXIMUM_BODY_BYTES) throw new Error("oversized_body");
      result += decoder.decode(chunk.value, { stream: true });
    }
    return result + decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
  }
}

function parseInput(body: string): ContextSelectionInput | null {
  const values = new URLSearchParams(body);
  const keys = [...values.keys()];
  if (keys.some((key) => key !== "intent" && key !== "organizationId")) return null;

  const intents = values.getAll("intent");
  const organizationIds = values.getAll("organizationId");
  if (intents.length !== 1) return null;

  if (intents[0] === "clear" && organizationIds.length === 0 && keys.length === 1) {
    return { intent: "clear" };
  }
  if (intents[0] !== "select" || organizationIds.length !== 1 || keys.length !== 2) return null;

  const organizationId = parseToroOrganizationId(organizationIds[0]);
  return organizationId ? { intent: "select", organizationId } : null;
}

export async function POST(request: Request) {
  if (!isPortalDeployment()) return boundaryFailure(404);

  const expectedOrigin = new URL(request.url).origin;
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (
    request.method !== "POST" ||
    request.headers.has("Next-Action") ||
    request.headers.get("origin") !== expectedOrigin ||
    (fetchSite !== undefined && fetchSite !== "same-origin") ||
    mediaType !== FORM_MEDIA_TYPE
  ) {
    return boundaryFailure(403);
  }

  let body: string;
  try {
    body = await limitedText(request);
  } catch {
    return boundaryFailure(413);
  }

  const input = parseInput(body);
  if (!input) {
    return redirectWithPreference(request, "/my-toro?context=invalid", null);
  }

  try {
    if (input.intent === "clear") {
      const context = await resolveToroContext({ mode: "personal" });
      return redirectWithPreference(
        request,
        context ? "/my-toro" : "/login?next=/my-toro",
        null,
      );
    }

    const context = await resolveToroContext({
      mode: "organization",
      orgId: input.organizationId,
    });
    if (
      !context ||
      context.mode !== "organization" ||
      context.orgId !== input.organizationId ||
      context.membership?.orgId !== input.organizationId ||
      context.membership.status !== "active" ||
      !context.availableOrgIds.includes(input.organizationId) ||
      !context.allowedDataScopes.includes("work_org") ||
      context.canUsePersonalVault ||
      !context.canUseOrganizationData ||
      context.requiresContextChoice
    ) {
      return redirectWithPreference(request, "/my-toro?context=invalid", null);
    }

    return redirectWithPreference(
      request,
      "/my-toro",
      serializeToroOrganizationPreference(context.userId, input.organizationId),
    );
  } catch {
    return redirectWithPreference(request, "/my-toro?context=invalid", null);
  }
}
