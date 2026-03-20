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
    packageTier?: unknown;
    paymentRecord?: unknown;
    packageEnrollment?: unknown;
    course?: unknown;
    resource?: unknown;
    courseProgress?: unknown;
    enrollmentAuditLog?: unknown;
  };

  return [
    runtimeClient.packageTier,
    runtimeClient.paymentRecord,
    runtimeClient.packageEnrollment,
    runtimeClient.course,
    runtimeClient.resource,
    runtimeClient.courseProgress,
    runtimeClient.enrollmentAuditLog,
  ].every(Boolean);
}

let prismaClient: PrismaClient;
const existingClient = globalForPrisma.prisma as PrismaClient | undefined;

if (existingClient && hasRequiredDelegates(existingClient)) {
  prismaClient = existingClient;
} else {
  existingClient?.$disconnect().catch(() => undefined);
  prismaClient = createPrismaClient();
}

globalForPrisma.prisma = prismaClient;

export const db = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
