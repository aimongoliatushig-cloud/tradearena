export const dynamic = "force-dynamic";

import { Landmark, ReceiptText } from "lucide-react";

import { ApplyForm } from "@/components/forms/apply-form";
import { PublicShell } from "@/components/layout/public-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { accountSizeLabels } from "@/lib/labels";
import { formatUsd, TRADEARENA_ENTRY_FEES, TRADEARENA_PAYMENT_DETAILS } from "@/lib/pricing";
import { getApplicantBuckets } from "@/server/services/applicant-service";
import { listSignupRooms } from "@/server/services/room-service";

export default async function ApplyPage() {
  const [buckets, signupRooms] = await Promise.all([getApplicantBuckets(), listSignupRooms()]);
  const entryFees = buckets
    .map((bucket) => {
      const label = accountSizeLabels[bucket.accountSize];
      const fee = TRADEARENA_ENTRY_FEES[label];

      if (!fee) {
        return null;
      }

      return {
        accountSize: bucket.accountSize,
        label,
        fee,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <PublicShell>
      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="glass-panel p-8">
            <div className="ftmo-kicker">Application</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">Сорилтын өрөөнд өргөдөл өгөх</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
              Та шууд өрөөнд орохгүй. Эхлээд дансны хэмжээ сонгож өргөдөл илгээнэ, дараа нь админ шалгаж урилга илгээнэ.
            </p>
          </div>

          <div className="grid gap-4">
            {buckets.map((bucket) => (
              <MetricCard
                key={bucket.accountSize}
                label={`${accountSizeLabels[bucket.accountSize]} ангилал`}
                value={`${bucket.active}/10`}
                hint={bucket.ready ? "Өрөө бүрдэхэд бэлэн" : "Хүсэлт цугларч байна"}
              />
            ))}
          </div>

          <div className="glass-panel p-6">
            <div className="ftmo-kicker">Payment Info</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Room 10/10 болсны дараах төлбөрийн мэдээлэл</h2>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Таны сонгосон ангиллын room 10 трейдерээр бүрдвэл тухайн room-ийн entry fee-г төлж оролцоогоо баталгаажуулна. Төлбөрийн дүн нь нүүр
              хуудасны үнэтэй ижил байна.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {entryFees.map((entry) => (
                <div key={entry.accountSize} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">{entry.label} entry fee</div>
                  <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{formatUsd(entry.fee)}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.4rem] border border-[#3daafe]/18 bg-[#0781fe]/10 p-4">
                <div className="flex items-start gap-3">
                  <Landmark className="mt-0.5 size-5 text-[#83c5ff]" />
                  <div>
                    <div className="text-sm font-semibold text-white">Төлбөр хийх данс</div>
                    <div className="mt-2 text-sm leading-7 text-white/72">
                      {TRADEARENA_PAYMENT_DETAILS.accountNumber}
                      <br />
                      {TRADEARENA_PAYMENT_DETAILS.bankName}
                      <br />
                      {TRADEARENA_PAYMENT_DETAILS.accountHolder}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <ReceiptText className="mt-0.5 size-5 text-[#83c5ff]" />
                  <div>
                    <div className="text-sm font-semibold text-white">Гүйлгээний утга</div>
                    <div className="mt-2 text-sm leading-7 text-white/62">{TRADEARENA_PAYMENT_DETAILS.transactionValueHint}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ApplyForm rooms={signupRooms} />
      </section>
    </PublicShell>
  );
}
