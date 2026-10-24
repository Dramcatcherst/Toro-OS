export const PORTAL_AUTH_COOKIE_BASE = "sb-abtyrbqlqbsastmridzp-auth-token";

export function isPortalAuthCookieName(name: string) {
  return /^sb-abtyrbqlqbsastmridzp-auth-token(?:\.\d+)?$/.test(name);
}
