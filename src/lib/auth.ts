import type { AdminUser } from "@prisma/client";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_ACCESS_AUDIT_ROUTE,
  buildAuthRedirectPath,
  getPublicMetadataRole,
  getRequestIpAddress,
  hasAdminRole,
} from "@/lib/admin-access";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const CLERK_MANAGED_PASSWORD_HASH = "CLERK_MANAGED_ACCOUNT";

type AdminAccessReason =
  | "ip_not_allowed"
  | "missing_email"
  | "mfa_required"
  | "rate_limited"
  | "unauthenticated"
  | "unauthorized";

type AdminRequestContext = {
  ipAddress: string | null;
  path: string;
  userAgent: string | null;
};

type ClerkAdminUser = {
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddress: {
    emailAddress: string;
  } | null;
  publicMetadata: unknown;
  twoFactorEnabled: boolean;
  username: string | null;
};

export type AdminAccessState =
  | {
      adminUser: AdminUser;
      allowed: true;
      role: string;
    }
  | {
      allowed: false;
      reason: AdminAccessReason;
      returnPath: string;
      status: 401 | 403 | 429;
    };

function getAdminIpAllowlist() {
  return env.ADMIN_IP_ALLOWLIST;
}

function isAdminIpAllowed(ipAddress: string | null) {
  const allowlist = getAdminIpAllowlist();

  if (!allowlist.length) {
    return true;
  }

  if (!ipAddress) {
    return false;
  }

  return allowlist.includes(ipAddress);
}

function normalizeEmailAddress(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

function isConfiguredAdminEmail(email: string | null) {
  return Boolean(email && env.ADMIN_EMAIL && email === env.ADMIN_EMAIL);
}

async function findAdminUserByEmail(email: string | null) {
  if (!email) {
    return null;
  }

  return db.adminUser.findUnique({
    where: { email },
  });
}

async function getAdminRequestContext(pathOverride?: string, requestHeaders?: Headers): Promise<AdminRequestContext> {
  const headerStore = requestHeaders ?? (await headers());

  return {
    ipAddress: getRequestIpAddress(headerStore),
    path: pathOverride || headerStore.get("x-ftmo-pathname") || "/admin",
    userAgent: headerStore.get("user-agent"),
  };
}

async function countFailedAdminAttempts(ipAddress: string | null) {
  if (!ipAddress) {
    return 0;
  }

  const windowStart = new Date(Date.now() - 60 * 60 * 1000);

  return db.submissionAttempt.count({
    where: {
      route: ADMIN_ACCESS_AUDIT_ROUTE,
      ipAddress,
      createdAt: {
        gte: windowStart,
      },
    },
  });
}

async function recordFailedAdminAccess(input: {
  email?: string | null;
  ipAddress: string | null;
  path: string;
  reason: AdminAccessReason;
  role?: string | null;
  status: 401 | 403 | 429;
  userAgent?: string | null;
  userId?: string | null;
}) {
  console.warn("[admin-access]", {
    email: input.email ?? null,
    ipAddress: input.ipAddress,
    path: input.path,
    reason: input.reason,
    role: input.role ?? null,
    status: input.status,
    userId: input.userId ?? null,
  });

  if (!input.ipAddress) {
    return;
  }

  try {
    await db.submissionAttempt.create({
      data: {
        route: ADMIN_ACCESS_AUDIT_ROUTE,
        ipAddress: input.ipAddress,
        metadata: {
          email: input.email ?? null,
          path: input.path,
          reason: input.reason,
          role: input.role ?? null,
          status: input.status,
          userAgent: input.userAgent ?? null,
          userId: input.userId ?? null,
        },
      },
    });
  } catch (error) {
    console.error("[admin-access-log-failed]", error);
  }
}

async function createDeniedAdminAccessState(input: {
  context: AdminRequestContext;
  email?: string | null;
  reason: Exclude<AdminAccessReason, "rate_limited">;
  role?: string | null;
  status: 401 | 403;
  userId?: string | null;
}): Promise<AdminAccessState> {
  const failedAttemptCount = (await countFailedAdminAttempts(input.context.ipAddress)) + 1;
  const isRateLimited = failedAttemptCount > env.ADMIN_ACCESS_RATE_LIMIT_PER_HOUR;
  const reason = isRateLimited ? "rate_limited" : input.reason;
  const status = isRateLimited ? 429 : input.status;

  await recordFailedAdminAccess({
    email: input.email,
    ipAddress: input.context.ipAddress,
    path: input.context.path,
    reason,
    role: input.role,
    status,
    userAgent: input.context.userAgent,
    userId: input.userId,
  });

  return {
    allowed: false,
    reason,
    returnPath: input.context.path,
    status,
  };
}

async function loadClerkAdminUser(userId: string): Promise<ClerkAdminUser | null> {
  try {
    const user = await currentUser();

    if (user) {
      return user;
    }
  } catch (error) {
    console.error("[admin-access-current-user-failed]", error);
  }

  try {
    const client = await clerkClient();
    return await client.users.getUser(userId);
  } catch (error) {
    console.error("[admin-access-clerk-user-failed]", error);
    return null;
  }
}

async function syncAdminProfile(user: ClerkAdminUser | null) {
  const email = normalizeEmailAddress(user?.primaryEmailAddress?.emailAddress);

  if (!email) {
    return null;
  }

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || email;
  const now = new Date();

  return db.adminUser.upsert({
    where: { email },
    update: {
      lastLoginAt: now,
      name,
    },
    create: {
      email,
      lastLoginAt: now,
      name,
      passwordHash: CLERK_MANAGED_PASSWORD_HASH,
    },
  });
}

export async function getAdminAccessState(options?: {
  requestHeaders?: Headers;
  requestPath?: string;
}): Promise<AdminAccessState> {
  const context = await getAdminRequestContext(options?.requestPath, options?.requestHeaders);

  if (!isAdminIpAllowed(context.ipAddress)) {
    return createDeniedAdminAccessState({
      context,
      reason: "ip_not_allowed",
      status: 403,
    });
  }

  const { userId } = await auth();

  if (!userId) {
    return createDeniedAdminAccessState({
      context,
      reason: "unauthenticated",
      status: 401,
    });
  }

  const user = await loadClerkAdminUser(userId);
  const email = normalizeEmailAddress(user?.primaryEmailAddress?.emailAddress);
  const role = getPublicMetadataRole(user?.publicMetadata);
  const hasClerkAdminRole = Boolean(user && hasAdminRole(user.publicMetadata));
  const adminUserByEmail = await findAdminUserByEmail(email);
  const hasEmailAdminAccess = isConfiguredAdminEmail(email) || Boolean(adminUserByEmail);

  if (!user || (!hasClerkAdminRole && !hasEmailAdminAccess)) {
    return createDeniedAdminAccessState({
      context,
      email,
      reason: "unauthorized",
      role,
      status: 403,
      userId,
    });
  }

  if (env.ADMIN_REQUIRE_MFA && !user.twoFactorEnabled) {
    return createDeniedAdminAccessState({
      context,
      email,
      reason: "mfa_required",
      role,
      status: 403,
      userId,
    });
  }

  const adminUser = await syncAdminProfile(user);

  if (!adminUser) {
    return createDeniedAdminAccessState({
      context,
      email,
      reason: "missing_email",
      role,
      status: 403,
      userId,
    });
  }

  return {
    adminUser,
    allowed: true,
    role: role ?? (isConfiguredAdminEmail(email) ? "configured_admin_email" : adminUserByEmail ? "admin_user_record" : "admin"),
  };
}

export async function requireAdminUser(options?: { requestPath?: string }) {
  const access = await getAdminAccessState({
    requestPath: options?.requestPath,
  });

  if (access.allowed) {
    return access.adminUser;
  }

  if (access.reason === "unauthenticated") {
    redirect(buildAuthRedirectPath(access.returnPath));
  }

  redirect("/");
}
