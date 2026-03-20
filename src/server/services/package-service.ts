import type { AccountSize, CourseAccessLevel } from "@prisma/client";

import { db } from "@/lib/db";
import { parseTextList, slugifyMn } from "@/lib/package-validators";

export async function listActivePackageTiers() {
  return db.packageTier.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { priceUsd: "asc" }],
  });
}

export async function listAdminPackageTiers() {
  return db.packageTier.findMany({
    include: {
      _count: {
        select: {
          enrollments: true,
          rooms: true,
          courses: true,
          resources: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getPackageTierBySlug(slug: string) {
  return db.packageTier.findUnique({
    where: { slug },
  });
}

export async function getPackageTierById(id: string) {
  return db.packageTier.findUnique({
    where: { id },
  });
}

export async function upsertPackageTier(input: {
  id?: string;
  nameMn: string;
  accountSize: AccountSize;
  priceUsd: number;
  maxUsers: number;
  featuresInput: string;
  strategyCount: number;
  includesCoaching: boolean;
  coachingHours: number;
  includesIndicators: boolean;
  courseAccessLevel: CourseAccessLevel;
  prioritySupport: boolean;
  sortOrder: number;
  isActive: boolean;
}) {
  const featuresMn = parseTextList(input.featuresInput);

  if (!featuresMn.length) {
    throw new Error("Багцын давуу талуудыг оруулна уу.");
  }

  const existing = input.id
    ? await db.packageTier.findUnique({
        where: { id: input.id },
      })
    : null;

  const slug = existing?.slug ?? slugifyMn(input.nameMn);

  const data = {
    slug,
    nameMn: input.nameMn,
    accountSize: input.accountSize,
    priceUsd: input.priceUsd,
    maxUsers: input.maxUsers,
    featuresMn,
    strategyCount: input.strategyCount,
    includesCoaching: input.includesCoaching,
    coachingHours: input.includesCoaching ? input.coachingHours : 0,
    includesIndicators: input.includesIndicators,
    courseAccessLevel: input.courseAccessLevel,
    prioritySupport: input.prioritySupport,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };

  if (input.id) {
    return db.packageTier.update({
      where: { id: input.id },
      data,
    });
  }

  return db.packageTier.create({
    data,
  });
}
