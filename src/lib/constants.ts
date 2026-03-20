import { ApplicantStatus, ChallengeStep, RoomPublicStatus } from "@prisma/client";

export { ACCOUNT_SIZE_OPTIONS, ROOM_STATUS_OPTIONS } from "@/lib/prisma-enums";

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
export const PACKAGE_ROOM_DECISION_WINDOW_HOURS = 48;
