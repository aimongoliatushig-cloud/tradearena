export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { Landmark, ReceiptText } from "lucide-react";

import { ApplyForm } from "@/components/forms/apply-form";
import { PublicShell } from "@/components/layout/public-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { accountSizeLabels } from "@/lib/labels";
import { formatUsd } from "@/lib/pricing";
import { getPaymentDetailsConfig } from "@/server/services/settings-service";
import { listSignupRooms } from "@/server/services/room-service";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { userId } = await auth();
  const [signupRooms, paymentDetails, user] = await Promise.all([
    listSignupRooms(),
    getPaymentDetailsConfig(),
    userId ? currentUser() : Promise.resolve(null),
  ]);
  const preferredSize = typeof params.size === "string" ? params.size : null;
  const preferredRoomId = signupRooms.find((room) => room.accountSize === preferredSize)?.id ?? signupRooms[0]?.id ?? "";

  const viewer = user
    ? {
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
      }
    : null;

  return (
    <PublicShell>
      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="glass-panel p-8">
            <div className="ftmo-kicker">ӨРӨӨНИЙ БҮРТГЭЛ</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">Дараагийн трейдерийн өрөөнд бүртгүүлэх</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
              Эхлээд Clerk-ээр хэрэглэгч болж бүртгүүлээд нэвтэрнэ. Дараа нь нээлттэй өрөөнөөс сонголтоо хийнэ. Явагдаж буй идэвхтэй
              өрөөнүүд шинэ бүртгэл авахгүй. Өрөө 10 трейдертэй болмогц төлбөрийн мэдээлэл болон эхлэх зааврыг и-мэйлээр илгээнэ.
            </p>
          </div>

          <div className="grid gap-4">
            {signupRooms.map((room) => (
              <MetricCard
                key={room.id}
                label={`${accountSizeLabels[room.accountSize]} өрөө`}
                value={`${room.activeApplicantCount}/${room.maxTraderCapacity}`}
                hint={`Орох хураамж ${formatUsd(room.entryFeeUsd)}`}
              />
            ))}
          </div>

          <div className="glass-panel p-6">
            <div className="ftmo-kicker">ТӨЛБӨР</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Өрөө дүүрсний дараа л төлбөр төлнө</h2>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Та шууд төлбөр хийхгүй. Эхлээд нээлттэй өрөөнд бүртгүүлнэ. Тухайн өрөө 10/10 трейдертэй болмогц өрөө бэлэн болсныг
              мэдэгдэж, орох хураамж төлөх болон challenge-ээ эхлүүлэх бэлтгэлийн мэдээллийг и-мэйлээр илгээнэ.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.4rem] border border-[#3daafe]/18 bg-[#0781fe]/10 p-4">
                <div className="flex items-start gap-3">
                  <Landmark className="mt-0.5 size-5 text-[#83c5ff]" />
                  <div>
                    <div className="text-sm font-semibold text-white">Банкны мэдээлэл</div>
                    <div className="mt-2 text-sm leading-7 text-white/72">
                      {paymentDetails.accountNumber}
                      <br />
                      {paymentDetails.bankName}
                      <br />
                      {paymentDetails.accountHolder}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <ReceiptText className="mt-0.5 size-5 text-[#83c5ff]" />
                  <div>
                    <div className="text-sm font-semibold text-white">Гүйлгээний утга</div>
                    <div className="mt-2 text-sm leading-7 text-white/62">{paymentDetails.transactionValueHint}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ApplyForm rooms={signupRooms} viewer={viewer} preferredRoomId={preferredRoomId} />
      </section>
    </PublicShell>
  );
}
