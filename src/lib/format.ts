import { AccountSize, RoomLifecycleStatus } from "@prisma/client";

import { DEFAULT_TARGET_PERCENT } from "@/lib/constants";
import { dayjs } from "@/lib/dayjs";
import { accountSizeLabels, roomStatusLabels } from "@/lib/labels";

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Тодорхойгүй";
  return dayjs(value).format("YYYY.MM.DD");
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Шинэчлэгдээгүй";
  return dayjs(value).format("YYYY.MM.DD HH:mm");
}

export function relativeFromNow(value: Date | string | null | undefined) {
  if (!value) return "Шинэчлэгдээгүй";
  return dayjs(value).fromNow();
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "0.00%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatAccountSize(size: AccountSize) {
  return accountSizeLabels[size];
}

export function formatRoomStatus(status: RoomLifecycleStatus) {
  return roomStatusLabels[status];
}

export function buildProgressValue(profitPercent: number, targetPercent = DEFAULT_TARGET_PERCENT) {
  if (profitPercent <= 0) return 0;
  return Math.min(100, (profitPercent / targetPercent) * 100);
}

export function buildNegativePressure(profitPercent: number, targetPercent = DEFAULT_TARGET_PERCENT) {
  if (profitPercent >= 0) return 0;
  return Math.min(100, (Math.abs(profitPercent) / targetPercent) * 100);
}
