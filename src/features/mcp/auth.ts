import "server-only";
import { isPublicDemo } from "@/lib/server/public-demo";

import { Buffer } from "node:buffer";

import type { AuthInfo } from "@modelcontextprotocol/server";

import { canonicalScopeRefForOrgId } from "@/features/brain/canonical-read";
import { resolveToroContextWithSupabase } from "@/features/context/resolver";
import type { ToroMcpReadRuntime } from "@/features/mcp/read-adapter-server";
import {
  createBearerSupabaseClient,
  verifySupabaseBearerToken,
} from "@/lib/supabase/bearer";

type JwtClaims = {
  client_id?: unknown;
  scope?: unknown;
};

function decodeVerifiedJwtClaims(accessToken: string): JwtClaims {
  const payload = accessToken.split(".")[1];
  if (!payload) return {};

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const value = JSON.parse(decoded);
    return value && typeof value === "object" ? (value as JwtClaims) : {};
  } catch {
    return {};
  }
}

function scopesFromClaims(claims: JwtClaims) {
  if (typeof claims.scope === "string") {
    return claims.scope
      .split(/\s+/)
      .map((scope) => scope.trim())
      .filter(Boolean);
  }

  if (Array.isArray(claims.scope)) {
    return claims.scope.filter(
      (scope): scope is string => typeof scope === "string" && Boolean(scope.trim()),
    );
  }

  return [];
}

export async function verifyToroMcpBearerToken(
  _request: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  const verified = await verifySupabaseBearerToken(bearerToken);
  if (!verified) return undefined;

  const claims = decodeVerifiedJwtClaims(bearerToken);

  return {
    token: bearerToken,
    clientId:
      typeof claims.client_id === "string" && claims.client_id.trim()
        ? claims.client_id
        : "supabase-oauth",
    scopes: scopesFromClaims(claims),
    extra: {
      userId: verified.user.id,
    },
  };
}

export async function resolveToroMcpBearerRuntime(
  bearerToken: string,
  scopeRef?: string,
): Promise<ToroMcpReadRuntime> {
  if (isPublicDemo()) {
    return { error: {
      code: "capability_unavailable",
      message: "Operational reads are disabled in the public demo.",
      retryable: false,
    } };
  }
  const client = createBearerSupabaseClient(bearerToken);

  let context = await resolveToroContextWithSupabase(
    client,
    { mode: "organization" },
    bearerToken,
  );

  if (!context) {
    return {
      supabase: client,
      error: {
        code: "forbidden",
        message:
          "The authenticated TORO identity has no readable organization context.",
        retryable: false,
      },
    };
  }

  if (scopeRef) {
    const orgId = context.availableOrgIds.find(
      (candidate) => canonicalScopeRefForOrgId(candidate) === scopeRef,
    );

    if (!orgId) {
      return {
        supabase: client,
        error: {
          code: "forbidden",
          message: "The requested TORO scope is not available to this identity.",
          retryable: false,
        },
      };
    }

    context = await resolveToroContextWithSupabase(
      client,
      { mode: "organization", orgId },
      bearerToken,
    );

    if (!context) {
      return {
        supabase: client,
        error: {
          code: "forbidden",
          message: "The requested TORO scope cannot be resolved.",
          retryable: false,
        },
      };
    }
  }

  return {
    context,
    supabase: client,
  };
}
