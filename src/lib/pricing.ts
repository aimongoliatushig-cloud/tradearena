import type { AccountSize } from "@prisma/client";

import { ACCOUNT_SIZE } from "@/lib/prisma-enums";

export const PRICING_COMPARISON_DATA = [
  { size: ACCOUNT_SIZE.SIZE_10K, label: "10K", ftmo: 102, tradeArena: 15 },
  { size: ACCOUNT_SIZE.SIZE_25K, label: "25K", ftmo: 290, tradeArena: 35 },
  { size: ACCOUNT_SIZE.SIZE_50K, label: "50K", ftmo: 400, tradeArena: 50 },
  { size: ACCOUNT_SIZE.SIZE_100K, label: "100K", ftmo: 630, tradeArena: 80 },
  { size: ACCOUNT_SIZE.SIZE_200K, label: "200K", ftmo: 1250, tradeArena: 160 },
] as const;

export const DEFAULT_ENTRY_FEE_BY_ACCOUNT_SIZE: Record<AccountSize, number> = {
  [ACCOUNT_SIZE.SIZE_10K]: 15,
  [ACCOUNT_SIZE.SIZE_25K]: 35,
  [ACCOUNT_SIZE.SIZE_50K]: 50,
  [ACCOUNT_SIZE.SIZE_100K]: 80,
  [ACCOUNT_SIZE.SIZE_200K]: 160,
};

export const DEFAULT_PAYMENT_DETAILS = {
  bankName: "Голомт банк",
  accountHolder: "Battushig",
  accountNumber: "MN530015001605199269",
  transactionValueHint: "Гүйлгээний утга дээр өрөөний нэр болон овог нэрээ бичнэ үү.",
} as const;

export function getDefaultEntryFeeUsd(accountSize: AccountSize) {
  return DEFAULT_ENTRY_FEE_BY_ACCOUNT_SIZE[accountSize];
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUsd(value: number) {
  return usdFormatter.format(value);
}
