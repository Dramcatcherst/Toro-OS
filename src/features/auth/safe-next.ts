export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) {
    return "/my-toro";
  }
  try {
    // Resolve against a fixed sentinel origin; never trust Host or a supplied origin.
    const origin = "https://toro.invalid";
    const destination = new URL(value, origin);
    if (destination.origin !== origin) return "/my-toro";
    if (/[\\\u0000-\u001f\u007f]/.test(decodeURIComponent(value))) return "/my-toro";
    const decodedPath = decodeURIComponent(destination.pathname);
    if (/[\\\u0000-\u0020\u007f]/.test(decodedPath) || decodedPath.startsWith("//")) return "/my-toro";
    return value;
  } catch {
    return "/my-toro";
  }
}
