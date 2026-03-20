import type { ResourceType } from "@prisma/client";

import { db } from "@/lib/db";

export async function listAdminResources() {
  return db.resource.findMany({
    include: {
      packageAccess: {
        include: {
          packageTier: true,
        },
      },
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function listAccessibleResources(packageTierId: string) {
  return db.resource.findMany({
    where: {
      isPublished: true,
      packageAccess: {
        some: {
          packageTierId,
        },
      },
    },
    include: {
      packageAccess: {
        include: {
          packageTier: true,
        },
      },
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function upsertResource(input: {
  id?: string;
  titleMn: string;
  descriptionMn?: string;
  type: ResourceType;
  linkUrl: string;
  packageTierIds: string[];
  sortOrder: number;
  isPublished: boolean;
}) {
  const data = {
    titleMn: input.titleMn,
    descriptionMn: input.descriptionMn || null,
    type: input.type,
    linkUrl: input.linkUrl,
    sortOrder: input.sortOrder,
    isPublished: input.isPublished,
  };

  if (input.id) {
    return db.$transaction(async (tx) => {
      const resource = await tx.resource.update({
        where: { id: input.id },
        data,
      });

      await tx.resourcePackageTier.deleteMany({
        where: { resourceId: input.id },
      });

      if (input.packageTierIds.length) {
        await tx.resourcePackageTier.createMany({
          data: input.packageTierIds.map((packageTierId) => ({
            resourceId: resource.id,
            packageTierId,
          })),
        });
      }

      return resource;
    });
  }

  return db.$transaction(async (tx) => {
    const resource = await tx.resource.create({
      data,
    });

    if (input.packageTierIds.length) {
      await tx.resourcePackageTier.createMany({
        data: input.packageTierIds.map((packageTierId) => ({
          resourceId: resource.id,
          packageTierId,
        })),
      });
    }

    return resource;
  });
}
