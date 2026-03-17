export const PRICING_COMPARISON_DATA = [
  { size: "10K", ftmo: 102, tradeArena: 15 },
  { size: "25K", ftmo: 290, tradeArena: 35 },
  { size: "50K", ftmo: 400, tradeArena: 50 },
  { size: "100K", ftmo: 630, tradeArena: 80 },
  { size: "200K", ftmo: 1250, tradeArena: 160 },
] as const;

export const TRADEARENA_ENTRY_FEES = Object.fromEntries(
  PRICING_COMPARISON_DATA.map(({ size, tradeArena }) => [size, tradeArena]),
) as Record<string, number>;

export const TRADEARENA_PAYMENT_DETAILS = {
  bankName: "Golomt bank",
  accountHolder: "Баттүшиг",
  accountNumber: "MN530015001605199269",
  transactionValueHint: "Гүйлгээний утга дээр өөрийн утасны дугаар болон овог нэрээ бичнэ үү.",
} as const;

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUsd(value: number) {
  return usdFormatter.format(value);
}
