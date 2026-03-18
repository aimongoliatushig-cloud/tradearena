import { AccountSize } from "@prisma/client";

export const PRICING_COMPARISON_DATA = [
  { size: AccountSize.SIZE_10K, label: "10K", ftmo: 102, tradeArena: 15 },
  { size: AccountSize.SIZE_25K, label: "25K", ftmo: 290, tradeArena: 35 },
  { size: AccountSize.SIZE_50K, label: "50K", ftmo: 400, tradeArena: 50 },
  { size: AccountSize.SIZE_100K, label: "100K", ftmo: 630, tradeArena: 80 },
  { size: AccountSize.SIZE_200K, label: "200K", ftmo: 1250, tradeArena: 160 },
] as const;

export const DEFAULT_ENTRY_FEE_BY_ACCOUNT_SIZE: Record<AccountSize, number> = {
  [AccountSize.SIZE_10K]: 15,
  [AccountSize.SIZE_25K]: 35,
  [AccountSize.SIZE_50K]: 50,
  [AccountSize.SIZE_100K]: 80,
  [AccountSize.SIZE_200K]: 160,
};

export const DEFAULT_PAYMENT_DETAILS = {
  bankName: "Golomt bank",
  accountHolder: "Ð‘Ð°Ñ‚Ñ‚Ò¯ÑˆÐ¸Ð³",
  accountNumber: "MN530015001605199269",
  transactionValueHint: "Ð“Ò¯Ð¹Ð»Ð³ÑÑÐ½Ð¸Ð¹ ÑƒÑ‚Ð³Ð° Ð´ÑÑÑ€ Ó©Ó©Ñ€Ð¸Ð¹Ð½ ÑƒÑ‚Ð°ÑÐ½Ñ‹ Ð´ÑƒÐ³Ð°Ð°Ñ€ Ð±Ð¾Ð»Ð¾Ð½ Ð¾Ð²Ð¾Ð³ Ð½ÑÑ€ÑÑ Ð±Ð¸Ñ‡Ð½Ñ Ò¯Ò¯.",
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
