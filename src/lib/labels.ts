import {
  ApplicantStatus,
  BlogPostStatus,
  ChallengeStep,
  CourseAccessLevel,
  EnrollmentDecisionChoice,
  JobStatus,
  NotificationChannel,
  NotificationStatus,
  PackageEnrollmentStatus,
  PaymentStatus,
  RoomPublicStatus,
  ResourceType,
  type AccountSize,
  type NotificationKind,
  type RoomLifecycleStatus,
} from "@prisma/client";

import {
  ACCOUNT_SIZE,
  BLOG_POST_STATUS,
  COURSE_ACCESS_LEVEL,
  ENROLLMENT_DECISION,
  NOTIFICATION_KIND,
  PACKAGE_ENROLLMENT_STATUS,
  PAYMENT_STATUS,
  RESOURCE_TYPE,
  ROOM_LIFECYCLE_STATUS,
} from "@/lib/prisma-enums";

export const accountSizeLabels: Record<AccountSize, string> = {
  [ACCOUNT_SIZE.SIZE_10K]: "10K",
  [ACCOUNT_SIZE.SIZE_25K]: "25K",
  [ACCOUNT_SIZE.SIZE_50K]: "50K",
  [ACCOUNT_SIZE.SIZE_100K]: "100K",
  [ACCOUNT_SIZE.SIZE_200K]: "200K",
};

export const stepLabels: Record<ChallengeStep, string> = {
  [ChallengeStep.STEP_1]: "Алхам 1",
  [ChallengeStep.STEP_2]: "Алхам 2",
};

export const roomStatusLabels: Record<RoomLifecycleStatus, string> = {
  [ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN]: "Нээлттэй",
  [ROOM_LIFECYCLE_STATUS.READY_TO_START]: "Бэлэн",
  [ROOM_LIFECYCLE_STATUS.AWAITING_DECISION]: "Шийдвэр хүлээж байна",
  [ROOM_LIFECYCLE_STATUS.ACTIVE]: "Идэвхтэй",
  [ROOM_LIFECYCLE_STATUS.EXPIRED]: "Дууссан",
  [ROOM_LIFECYCLE_STATUS.COMPLETED]: "Хаагдсан",
  [ROOM_LIFECYCLE_STATUS.ARCHIVED]: "Архивласан",
};

export const roomPublicStatusLabels: Record<RoomPublicStatus, string> = {
  [RoomPublicStatus.PUBLIC]: "Нээлттэй",
  [RoomPublicStatus.HIDDEN]: "Нууц",
};

export const applicantStatusLabels: Record<ApplicantStatus, string> = {
  [ApplicantStatus.PENDING]: "Хүлээгдэж байна",
  [ApplicantStatus.ACCEPTED]: "Зөвшөөрсөн",
  [ApplicantStatus.ASSIGNED]: "Оноосон",
  [ApplicantStatus.INVITATION_SENT]: "Мэдэгдсэн",
  [ApplicantStatus.JOINED]: "Нэгдсэн",
  [ApplicantStatus.REJECTED]: "Татгалзсан",
};

export const jobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.RUNNING]: "Ажиллаж байна",
  [JobStatus.SUCCESS]: "Амжилттай",
  [JobStatus.FAILED]: "Алдаа",
  [JobStatus.PARTIAL]: "Хэсэгчлэн",
  [JobStatus.SKIPPED]: "Алгассан",
};

export const notificationChannelLabels: Record<NotificationChannel, string> = {
  [NotificationChannel.EMAIL]: "И-мэйл",
  [NotificationChannel.TELEGRAM]: "Telegram",
};

export const notificationKindLabels: Record<NotificationKind, string> = {
  [NOTIFICATION_KIND.ROOM_INVITATION]: "Өрөөний урилга",
  [NOTIFICATION_KIND.ROOM_READY]: "Өрөө бэлэн",
  [NOTIFICATION_KIND.GENERAL_UPDATE]: "Ерөнхий шинэчлэлт",
};

export const notificationStatusLabels: Record<NotificationStatus, string> = {
  [NotificationStatus.PENDING]: "Хүлээгдэж байна",
  [NotificationStatus.SENT]: "Илгээсэн",
  [NotificationStatus.FAILED]: "Алдаа",
  [NotificationStatus.SKIPPED]: "Алгассан",
};

export const blogPostStatusLabels: Record<BlogPostStatus, string> = {
  [BLOG_POST_STATUS.DRAFT]: "Ноорог",
  [BLOG_POST_STATUS.PUBLISHED]: "Нийтэлсэн",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING_SUBMISSION]: "Төлбөрийн мэдээлэл дутуу",
  [PAYMENT_STATUS.PENDING_CONFIRMATION]: "Шалгаж байна",
  [PAYMENT_STATUS.CONFIRMED]: "Баталгаажсан",
  [PAYMENT_STATUS.CANCELLED]: "Цуцлагдсан",
};

export const packageEnrollmentStatusLabels: Record<PackageEnrollmentStatus, string> = {
  [PACKAGE_ENROLLMENT_STATUS.PENDING_PAYMENT]: "Төлбөр хүлээгдэж байна",
  [PACKAGE_ENROLLMENT_STATUS.PENDING_CONFIRMATION]: "Баталгаажуулж байна",
  [PACKAGE_ENROLLMENT_STATUS.ENROLLED]: "Идэвхтэй",
  [PACKAGE_ENROLLMENT_STATUS.AWAITING_DECISION]: "Шийдвэр хүлээж байна",
  [PACKAGE_ENROLLMENT_STATUS.MERGED]: "Нэгтгэсэн",
  [PACKAGE_ENROLLMENT_STATUS.CANCELLED]: "Цуцлагдсан",
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  [RESOURCE_TYPE.STRATEGY]: "Стратеги",
  [RESOURCE_TYPE.INDICATOR]: "Индикатор",
  [RESOURCE_TYPE.TOOL]: "Хэрэгсэл",
};

export const courseAccessLevelLabels: Record<CourseAccessLevel, string> = {
  [COURSE_ACCESS_LEVEL.BASIC]: "Суурь",
  [COURSE_ACCESS_LEVEL.TRADING_PLAN]: "Төлөвлөгөө",
  [COURSE_ACCESS_LEVEL.INTERMEDIATE]: "Дунд шат",
  [COURSE_ACCESS_LEVEL.ADVANCED]: "Ахисан шат",
  [COURSE_ACCESS_LEVEL.FULL_ADVANCED]: "Бүрэн ахисан шат",
};

export const enrollmentDecisionLabels: Record<EnrollmentDecisionChoice, string> = {
  [ENROLLMENT_DECISION.MERGE]: "Нэгтгэх",
  [ENROLLMENT_DECISION.WAIT]: "Хүлээх",
};
