import { AccountSize, ApplicantStatus, ChallengeStep, RoomLifecycleStatus, RoomPublicStatus } from "@prisma/client";

export const ACCOUNT_SIZE_OPTIONS = [
  AccountSize.SIZE_10K,
  AccountSize.SIZE_25K,
  AccountSize.SIZE_50K,
  AccountSize.SIZE_100K,
  AccountSize.SIZE_200K,
] as const;

export const ROOM_STATUS_OPTIONS = [
  RoomLifecycleStatus.SIGNUP_OPEN,
  RoomLifecycleStatus.READY_TO_START,
  RoomLifecycleStatus.ACTIVE,
  RoomLifecycleStatus.EXPIRED,
  RoomLifecycleStatus.COMPLETED,
  RoomLifecycleStatus.ARCHIVED,
] as const;

export const ROOM_PUBLIC_STATUS_OPTIONS = [RoomPublicStatus.PUBLIC, RoomPublicStatus.HIDDEN] as const;
export const STEP_OPTIONS = [ChallengeStep.STEP_1, ChallengeStep.STEP_2] as const;

export const APPLICANT_STATUS_OPTIONS = [
  ApplicantStatus.PENDING,
  ApplicantStatus.ACCEPTED,
  ApplicantStatus.ASSIGNED,
  ApplicantStatus.INVITATION_SENT,
  ApplicantStatus.JOINED,
  ApplicantStatus.REJECTED,
] as const;

export const DEFAULT_TARGET_PERCENT = 5;
export const APPLY_RATE_LIMIT_PER_HOUR = 5;
export const DEFAULT_UPDATE_TIMES = ["09:00", "21:00"];
