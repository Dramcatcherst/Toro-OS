/** Public OAuth resource metadata must never carry credentials or private URL parts. */
export function normalizeToroMcpResourceUrl(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) return null;
    if (url.username || url.password || url.href.includes("?") || url.href.includes("#")) return null;
    if (!url.pathname.endsWith("/api/mcp")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
