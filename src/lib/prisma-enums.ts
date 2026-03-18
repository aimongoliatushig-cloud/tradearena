import type { AccountSize, NotificationKind, RoomLifecycleStatus } from "@prisma/client";

export const ACCOUNT_SIZE = {
  SIZE_10K: "SIZE_10K",
  SIZE_25K: "SIZE_25K",
  SIZE_50K: "SIZE_50K",
  SIZE_100K: "SIZE_100K",
  SIZE_200K: "SIZE_200K",
} as const satisfies Record<string, AccountSize>;

export const ACCOUNT_SIZE_OPTIONS = [
  ACCOUNT_SIZE.SIZE_10K,
  ACCOUNT_SIZE.SIZE_25K,
  ACCOUNT_SIZE.SIZE_50K,
  ACCOUNT_SIZE.SIZE_100K,
  ACCOUNT_SIZE.SIZE_200K,
] as const satisfies readonly AccountSize[];

export const ROOM_LIFECYCLE_STATUS = {
  SIGNUP_OPEN: "SIGNUP_OPEN",
  READY_TO_START: "READY_TO_START",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const satisfies Record<string, RoomLifecycleStatus>;

export const ROOM_STATUS_OPTIONS = [
  ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN,
  ROOM_LIFECYCLE_STATUS.READY_TO_START,
  ROOM_LIFECYCLE_STATUS.ACTIVE,
  ROOM_LIFECYCLE_STATUS.EXPIRED,
  ROOM_LIFECYCLE_STATUS.COMPLETED,
  ROOM_LIFECYCLE_STATUS.ARCHIVED,
] as const satisfies readonly RoomLifecycleStatus[];

export const SIGNUP_ROOM_STATUS_OPTIONS = [
  ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN,
  ROOM_LIFECYCLE_STATUS.READY_TO_START,
] as const satisfies readonly RoomLifecycleStatus[];

export const NOTIFICATION_KIND = {
  ROOM_INVITATION: "ROOM_INVITATION",
  ROOM_READY: "ROOM_READY",
  GENERAL_UPDATE: "GENERAL_UPDATE",
} as const satisfies Record<string, NotificationKind>;
