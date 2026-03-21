import { getCurrentEnrollmentForUser, hasConfirmedPaymentAccess } from "@/server/services/enrollment-service";
import { listAccessibleCourses } from "@/server/services/course-service";
import { listAccessibleResources } from "@/server/services/resource-service";
import { getMemberExperienceConfig } from "@/server/services/settings-service";

export async function getMemberDashboard(clerkUserId: string) {
  const enrollment = await getCurrentEnrollmentForUser(clerkUserId);

  if (!enrollment) {
    return {
      contentUnlocked: false,
      enrollment: null,
      courses: [],
      strategies: [],
      tools: [],
      indicators: [],
      coaching: null,
    };
  }

  if (!hasConfirmedPaymentAccess(enrollment)) {
    return {
      contentUnlocked: false,
      enrollment,
      courses: [],
      strategies: [],
      tools: [],
      indicators: [],
      coaching: null,
    };
  }

  const [courses, resources, memberExperience] = await Promise.all([
    listAccessibleCourses(enrollment.packageTierId),
    listAccessibleResources(enrollment.packageTierId),
    getMemberExperienceConfig(),
  ]);

  const progressByCourseId = new Map(
    courses.flatMap((course) =>
      course.progress
        .filter((item) => item.clerkUserId === clerkUserId)
        .map((item) => [course.id, item] as const),
    ),
  );

  return {
    contentUnlocked: true,
    enrollment,
    courses: courses.map((course) => ({
      ...course,
      viewerProgress: progressByCourseId.get(course.id) ?? null,
    })),
    strategies: resources.filter((item) => item.type === "STRATEGY"),
    tools: resources.filter((item) => item.type === "TOOL"),
    indicators: resources.filter((item) => item.type === "INDICATOR"),
    coaching: enrollment.packageTier.includesCoaching
      ? {
          hours: enrollment.packageTier.coachingHours,
          label: memberExperience.coachingCtaLabel,
          url: memberExperience.coachingCtaUrl,
          supportLabel: memberExperience.supportCtaLabel,
          supportUrl: memberExperience.supportCtaUrl,
        }
      : null,
  };
}
