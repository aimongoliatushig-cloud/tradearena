import {
  ApplicantStatus,
  ChallengeStep,
  JobStatus,
  NotificationChannel,
  NotificationStatus,
  RoomPublicStatus,
  type AccountSize,
  type NotificationKind,
  type RoomLifecycleStatus,
} from "@prisma/client";

import { ACCOUNT_SIZE, NOTIFICATION_KIND, ROOM_LIFECYCLE_STATUS } from "@/lib/prisma-enums";

export const accountSizeLabels: Record<AccountSize, string> = {
  [ACCOUNT_SIZE.SIZE_10K]: "10K",
  [ACCOUNT_SIZE.SIZE_25K]: "25K",
  [ACCOUNT_SIZE.SIZE_50K]: "50K",
  [ACCOUNT_SIZE.SIZE_100K]: "100K",
  [ACCOUNT_SIZE.SIZE_200K]: "200K",
};

export const stepLabels: Record<ChallengeStep, string> = {
  [ChallengeStep.STEP_1]: "Step 1",
  [ChallengeStep.STEP_2]: "Step 2",
};

export const roomStatusLabels: Record<RoomLifecycleStatus, string> = {
  [ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN]: "Signup open",
  [ROOM_LIFECYCLE_STATUS.READY_TO_START]: "Ready to start",
  [ROOM_LIFECYCLE_STATUS.ACTIVE]: "Active",
  [ROOM_LIFECYCLE_STATUS.EXPIRED]: "Expired",
  [ROOM_LIFECYCLE_STATUS.COMPLETED]: "Completed",
  [ROOM_LIFECYCLE_STATUS.ARCHIVED]: "Archived",
};

export const roomPublicStatusLabels: Record<RoomPublicStatus, string> = {
  [RoomPublicStatus.PUBLIC]: "Public",
  [RoomPublicStatus.HIDDEN]: "Hidden",
};

export const applicantStatusLabels: Record<ApplicantStatus, string> = {
  [ApplicantStatus.PENDING]: "Pending",
  [ApplicantStatus.ACCEPTED]: "Accepted",
  [ApplicantStatus.ASSIGNED]: "Assigned",
  [ApplicantStatus.INVITATION_SENT]: "Invitation sent",
  [ApplicantStatus.JOINED]: "Joined",
  [ApplicantStatus.REJECTED]: "Rejected",
};

export const jobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.RUNNING]: "Running",
  [JobStatus.SUCCESS]: "Success",
  [JobStatus.FAILED]: "Failed",
  [JobStatus.PARTIAL]: "Partial",
  [JobStatus.SKIPPED]: "Skipped",
};

export const notificationChannelLabels: Record<NotificationChannel, string> = {
  [NotificationChannel.EMAIL]: "Email",
  [NotificationChannel.TELEGRAM]: "Telegram",
};

export const notificationKindLabels: Record<NotificationKind, string> = {
  [NOTIFICATION_KIND.ROOM_INVITATION]: "Room invitation",
  [NOTIFICATION_KIND.ROOM_READY]: "Room ready",
  [NOTIFICATION_KIND.GENERAL_UPDATE]: "General update",
};

export const notificationStatusLabels: Record<NotificationStatus, string> = {
  [NotificationStatus.PENDING]: "Pending",
  [NotificationStatus.SENT]: "Sent",
  [NotificationStatus.FAILED]: "Failed",
  [NotificationStatus.SKIPPED]: "Skipped",
};
