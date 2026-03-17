import {
  AccountSize,
  ApplicantStatus,
  ChallengeStep,
  JobStatus,
  NotificationChannel,
  NotificationStatus,
  RoomLifecycleStatus,
  RoomPublicStatus,
} from "@prisma/client";

export const accountSizeLabels: Record<AccountSize, string> = {
  [AccountSize.SIZE_10K]: "10K",
  [AccountSize.SIZE_25K]: "25K",
  [AccountSize.SIZE_50K]: "50K",
  [AccountSize.SIZE_100K]: "100K",
};

export const stepLabels: Record<ChallengeStep, string> = {
  [ChallengeStep.STEP_1]: "Алхам 1",
  [ChallengeStep.STEP_2]: "Алхам 2",
};

export const roomStatusLabels: Record<RoomLifecycleStatus, string> = {
  [RoomLifecycleStatus.ACTIVE]: "Идэвхтэй",
  [RoomLifecycleStatus.EXPIRED]: "Хугацаа дууссан",
  [RoomLifecycleStatus.COMPLETED]: "Дууссан",
  [RoomLifecycleStatus.ARCHIVED]: "Архивласан",
};

export const roomPublicStatusLabels: Record<RoomPublicStatus, string> = {
  [RoomPublicStatus.PUBLIC]: "Нээлттэй",
  [RoomPublicStatus.HIDDEN]: "Нууц",
};

export const applicantStatusLabels: Record<ApplicantStatus, string> = {
  [ApplicantStatus.PENDING]: "Хүлээгдэж байна",
  [ApplicantStatus.ACCEPTED]: "Зөвшөөрсөн",
  [ApplicantStatus.ASSIGNED]: "Оноосон",
  [ApplicantStatus.INVITATION_SENT]: "Урилга илгээсэн",
  [ApplicantStatus.JOINED]: "Нэгдсэн",
  [ApplicantStatus.REJECTED]: "Татгалзсан",
};

export const jobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.RUNNING]: "Ажиллаж байна",
  [JobStatus.SUCCESS]: "Амжилттай",
  [JobStatus.FAILED]: "Амжилтгүй",
  [JobStatus.PARTIAL]: "Хэсэгчлэн",
  [JobStatus.SKIPPED]: "Алгассан",
};

export const notificationChannelLabels: Record<NotificationChannel, string> = {
  [NotificationChannel.EMAIL]: "Имэйл",
  [NotificationChannel.TELEGRAM]: "Telegram",
};

export const notificationStatusLabels: Record<NotificationStatus, string> = {
  [NotificationStatus.PENDING]: "Хүлээгдэж байна",
  [NotificationStatus.SENT]: "Илгээсэн",
  [NotificationStatus.FAILED]: "Алдаа",
  [NotificationStatus.SKIPPED]: "Алгассан",
};
