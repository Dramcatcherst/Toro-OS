import "server-only";
import type { AlegraNativeHttp } from "./alegra-native-purchase-transport";
export function createAlegraNativeHttp(input: { authenticatedFetch: (url: string, options: RequestInit) => Promise<Response> }): AlegraNativeHttp {
  // The existing secure host supplies account-scoped authentication. This
  // module never accepts a token or reads environment secrets.
  const authenticatedFetch = input.authenticatedFetch;
  if (typeof authenticatedFetch !== "function") throw new Error("NATIVE_SECURE_CLIENT_REQUIRED");
  return { async request(request) {
    const readable = /^\/(?:company|bills(?:\/[1-9]\d*)?|contacts\/[1-9]\d*|categories\/[1-9]\d*|cost-centers\/[1-9]\d*|taxes\/[1-9]\d*)$/.test(request.path);
    if ((request.method === "POST" && request.path !== "/bills") || (request.method === "GET" && !readable) ||
        (request.method !== "GET" && request.method !== "POST")) throw new Error("NATIVE_HTTP_ROUTE_FORBIDDEN");
    const url = new URL("https://api.alegra.com/api/v1" + request.path);
    const allowedQuery = new Set(["metadata", "start", "limit", "billNumber", "client_id"]);
    for (const [key, value] of Object.entries(request.query ?? {})) {
      if (request.method !== "GET" || request.path !== "/bills" || !allowedQuery.has(key) || typeof value !== "string") throw new Error("NATIVE_HTTP_QUERY_FORBIDDEN");
      url.searchParams.set(key, value);
    }
    const response = await authenticatedFetch(url.toString(), {
      method: request.method, headers: { accept: "application/json", ...(request.method === "POST" ? { "content-type": "application/json" } : {}) },
      ...(request.method === "POST" ? { body: JSON.stringify(request.body) } : {}),
      redirect: "error", credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(20_000),
    });
    return { status: response.status, data: await response.json() };
  } };
}
