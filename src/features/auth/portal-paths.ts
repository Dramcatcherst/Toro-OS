// The published Portal's page destinations are shared by its perimeter and
// post-login navigation. APIs/assets are never post-login destinations.
const portalPages = new Set([
  "/login", "/portal", "/my-toro", "/my-toro/herramientas", "/brain",
  "/booking-assist",
]);

export function isPortalPagePath(path: string) { return portalPages.has(path); }
