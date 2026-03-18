import {
  AccountSize,
  ApplicantStatus,
  ChallengeStep,
  JobStatus,
  NotificationKind,
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
  [AccountSize.SIZE_200K]: "200K",
};

export const stepLabels: Record<ChallengeStep, string> = {
  [ChallengeStep.STEP_1]: "ÐÐ»Ñ…Ð°Ð¼ 1",
  [ChallengeStep.STEP_2]: "ÐÐ»Ñ…Ð°Ð¼ 2",
};

export const roomStatusLabels: Record<RoomLifecycleStatus, string> = {
  [RoomLifecycleStatus.SIGNUP_OPEN]: "Ð‘Ò¯Ñ€Ñ‚Ð³ÑÐ» Ð½ÑÑÐ»Ñ‚Ñ‚ÑÐ¹",
  [RoomLifecycleStatus.READY_TO_START]: "Ð­Ñ…Ð»ÑÑ…ÑÐ´ Ð±ÑÐ»ÑÐ½",
  [RoomLifecycleStatus.ACTIVE]: "Ð˜Ð´ÑÐ²Ñ…Ñ‚ÑÐ¹",
  [RoomLifecycleStatus.EXPIRED]: "Ð¥ÑƒÐ³Ð°Ñ†Ð°Ð° Ð´ÑƒÑƒÑÑÐ°Ð½",
  [RoomLifecycleStatus.COMPLETED]: "Ð”ÑƒÑƒÑÑÐ°Ð½",
  [RoomLifecycleStatus.ARCHIVED]: "ÐÑ€Ñ…Ð¸Ð²Ð»Ð°ÑÐ°Ð½",
};

export const roomPublicStatusLabels: Record<RoomPublicStatus, string> = {
  [RoomPublicStatus.PUBLIC]: "ÐÑÑÐ»Ñ‚Ñ‚ÑÐ¹",
  [RoomPublicStatus.HIDDEN]: "ÐÑƒÑƒÑ†",
};

export const applicantStatusLabels: Record<ApplicantStatus, string> = {
  [ApplicantStatus.PENDING]: "Ð¥Ò¯Ð»ÑÑÐ³Ð´ÑÐ¶ Ð±Ð°Ð¹Ð½Ð°",
  [ApplicantStatus.ACCEPTED]: "Ð—Ó©Ð²ÑˆÓ©Ó©Ñ€ÑÓ©Ð½",
  [ApplicantStatus.ASSIGNED]: "ÐžÐ½Ð¾Ð¾ÑÐ¾Ð½",
  [ApplicantStatus.INVITATION_SENT]: "Ð£Ñ€Ð¸Ð»Ð³Ð° Ð¸Ð»Ð³ÑÑÑÑÐ½",
  [ApplicantStatus.JOINED]: "ÐÑÐ³Ð´ÑÑÐ½",
  [ApplicantStatus.REJECTED]: "Ð¢Ð°Ñ‚Ð³Ð°Ð»Ð·ÑÐ°Ð½",
};

export const jobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.RUNNING]: "ÐÐ¶Ð¸Ð»Ð»Ð°Ð¶ Ð±Ð°Ð¹Ð½Ð°",
  [JobStatus.SUCCESS]: "ÐÐ¼Ð¶Ð¸Ð»Ñ‚Ñ‚Ð°Ð¹",
  [JobStatus.FAILED]: "ÐÐ¼Ð¶Ð¸Ð»Ñ‚Ð³Ò¯Ð¹",
  [JobStatus.PARTIAL]: "Ð¥ÑÑÑÐ³Ñ‡Ð»ÑÐ½",
  [JobStatus.SKIPPED]: "ÐÐ»Ð³Ð°ÑÑÐ°Ð½",
};

export const notificationChannelLabels: Record<NotificationChannel, string> = {
  [NotificationChannel.EMAIL]: "Ð˜Ð¼ÑÐ¹Ð»",
  [NotificationChannel.TELEGRAM]: "Telegram",
};

export const notificationKindLabels: Record<NotificationKind, string> = {
  [NotificationKind.ROOM_INVITATION]: "Room invitation",
  [NotificationKind.ROOM_READY]: "Room ready",
  [NotificationKind.GENERAL_UPDATE]: "General update",
};

export const notificationStatusLabels: Record<NotificationStatus, string> = {
  [NotificationStatus.PENDING]: "Ð¥Ò¯Ð»ÑÑÐ³Ð´ÑÐ¶ Ð±Ð°Ð¹Ð½Ð°",
  [NotificationStatus.SENT]: "Ð˜Ð»Ð³ÑÑÑÑÐ½",
  [NotificationStatus.FAILED]: "ÐÐ»Ð´Ð°Ð°",
  [NotificationStatus.SKIPPED]: "ÐÐ»Ð³Ð°ÑÑÐ°Ð½",
};
