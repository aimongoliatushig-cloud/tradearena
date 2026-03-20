import { db } from "@/lib/db";
import { parseExternalUrlList, slugifyMn } from "@/lib/package-validators";

export async function listAdminCourses() {
  return db.course.findMany({
    include: {
      packageAccess: {
        include: {
          packageTier: true,
        },
      },
      _count: {
        select: {
          progress: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function listAccessibleCourses(packageTierId: string) {
  return db.course.findMany({
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
      progress: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getAccessibleCourseBySlug(input: { packageTierId: string; slug: string }) {
  return db.course.findFirst({
    where: {
      slug: input.slug,
      isPublished: true,
      packageAccess: {
        some: {
          packageTierId: input.packageTierId,
        },
      },
    },
    include: {
      packageAccess: {
        include: {
          packageTier: true,
        },
      },
      progress: true,
    },
  });
}

export async function upsertCourse(input: {
  id?: string;
  titleMn: string;
  descriptionMn?: string;
  videoUrl?: string;
  textContent?: string;
  pdfUrlsInput?: string;
  packageTierIds: string[];
  sortOrder: number;
  isPublished: boolean;
}) {
  const pdfUrls = parseExternalUrlList(input.pdfUrlsInput);
  const existing = input.id
    ? await db.course.findUnique({
        where: { id: input.id },
      })
    : null;

  const slug = existing?.slug ?? slugifyMn(input.titleMn);

  if (!input.videoUrl && !input.textContent && !pdfUrls.length) {
    throw new Error("Сургалтад дор хаяж видео, текст эсвэл PDF агуулга хэрэгтэй.");
  }

  const data = {
    slug,
    titleMn: input.titleMn,
    descriptionMn: input.descriptionMn || null,
    videoUrl: input.videoUrl || null,
    textContent: input.textContent || null,
    pdfUrls,
    sortOrder: input.sortOrder,
    isPublished: input.isPublished,
  };

  if (input.id) {
    return db.$transaction(async (tx) => {
      const course = await tx.course.update({
        where: { id: input.id },
        data,
      });

      await tx.coursePackageTier.deleteMany({
        where: { courseId: input.id },
      });

      if (input.packageTierIds.length) {
        await tx.coursePackageTier.createMany({
          data: input.packageTierIds.map((packageTierId) => ({
            courseId: course.id,
            packageTierId,
          })),
        });
      }

      return course;
    });
  }

  return db.$transaction(async (tx) => {
    const course = await tx.course.create({
      data,
    });

    if (input.packageTierIds.length) {
      await tx.coursePackageTier.createMany({
        data: input.packageTierIds.map((packageTierId) => ({
          courseId: course.id,
          packageTierId,
        })),
      });
    }

    return course;
  });
}

export async function setCourseProgress(input: {
  clerkUserId: string;
  courseId: string;
  percentComplete: number;
  enrollmentId?: string;
}) {
  return db.courseProgress.upsert({
    where: {
      clerkUserId_courseId: {
        clerkUserId: input.clerkUserId,
        courseId: input.courseId,
      },
    },
    update: {
      percentComplete: input.percentComplete,
      enrollmentId: input.enrollmentId,
      startedAt: input.percentComplete > 0 ? new Date() : null,
      completedAt: input.percentComplete >= 100 ? new Date() : null,
    },
    create: {
      clerkUserId: input.clerkUserId,
      courseId: input.courseId,
      enrollmentId: input.enrollmentId,
      percentComplete: input.percentComplete,
      startedAt: input.percentComplete > 0 ? new Date() : null,
      completedAt: input.percentComplete >= 100 ? new Date() : null,
    },
  });
}
