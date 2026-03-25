import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function hasRequiredDelegates(client?: PrismaClient) {
  if (!client) {
    return false;
  }

  const runtimeClient = client as PrismaClient & {
    blogPostAnalyticsEvent?: unknown;
    packageTier?: unknown;
    paymentRecord?: unknown;
    packageEnrollment?: unknown;
    course?: unknown;
    resource?: unknown;
    courseProgress?: unknown;
    enrollmentAuditLog?: unknown;
  };

  return [
    runtimeClient.blogPostAnalyticsEvent,
    runtimeClient.packageTier,
    runtimeClient.paymentRecord,
    runtimeClient.packageEnrollment,
    runtimeClient.course,
    runtimeClient.resource,
    runtimeClient.courseProgress,
    runtimeClient.enrollmentAuditLog,
  ].every(Boolean);
}

function getOrCreatePrismaClient(): PrismaClient {
  const existingClient = globalForPrisma.prisma;

  if (hasRequiredDelegates(existingClient)) {
    return existingClient!;
  }

  existingClient?.$disconnect().catch(() => undefined);
  const nextClient = createPrismaClient();
  globalForPrisma.prisma = nextClient;
  return nextClient;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getOrCreatePrismaClient();
    const value = Reflect.get(client, property);

    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
