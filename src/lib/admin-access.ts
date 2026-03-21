export const ADMIN_ROLE = "admin";
export const ADMIN_ACCESS_AUDIT_ROUTE = "/admin/access";

export function buildAuthRedirectPath(returnPath: string) {
  const params = new URLSearchParams({ redirect_url: returnPath || "/admin" });
  return `/sign-in?${params.toString()}`;
}

export function normalizeIpAddress(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed === "::1") {
    return "127.0.0.1";
  }

  if (trimmed.startsWith("::ffff:")) {
    return trimmed.slice(7);
  }

  return trimmed;
}

export function getRequestIpAddress(source: Pick<Headers, "get">) {
  const forwardedFor = source.get("x-forwarded-for");

  if (forwardedFor) {
    return normalizeIpAddress(forwardedFor.split(",")[0]);
  }

  return normalizeIpAddress(source.get("x-real-ip"));
}

export function getPublicMetadataRole(publicMetadata: unknown) {
  if (!publicMetadata || typeof publicMetadata !== "object") {
    return null;
  }

  const role = (publicMetadata as Record<string, unknown>).role;
  return typeof role === "string" ? role : null;
}

export function hasAdminRole(publicMetadata: unknown) {
  return getPublicMetadataRole(publicMetadata) === ADMIN_ROLE;
}
