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

export default async function ApplyPage() {
  const { userId } = await auth();
  const [signupRooms, paymentDetails, user] = await Promise.all([
    listSignupRooms(),
    getPaymentDetailsConfig(),
    userId ? currentUser() : Promise.resolve(null),
  ]);

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
            <div className="ftmo-kicker">Room Signup</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">Join the next trader room</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
              Sign up with Clerk first, then choose one of the open rooms. Running rooms are closed for new registrations. When a room
              reaches 10 traders, we will email everyone with the payment details and the start instructions.
            </p>
          </div>

          <div className="grid gap-4">
            {signupRooms.map((room) => (
              <MetricCard
                key={room.id}
                label={`${accountSizeLabels[room.accountSize]} room`}
                value={`${room.activeApplicantCount}/${room.maxTraderCapacity}`}
                hint={`Entry fee ${formatUsd(room.entryFeeUsd)}`}
              />
            ))}
          </div>

          <div className="glass-panel p-6">
            <div className="ftmo-kicker">Entry Payment</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Payment is only due when the room is full</h2>
            <p className="mt-3 text-sm leading-7 text-white/58">
              You do not pay immediately. First you join an open room. Once that room reaches 10/10 traders, we email you that the room
              is ready, ask you to pay the entry fee, and prepare you to start the challenge.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.4rem] border border-[#3daafe]/18 bg-[#0781fe]/10 p-4">
                <div className="flex items-start gap-3">
                  <Landmark className="mt-0.5 size-5 text-[#83c5ff]" />
                  <div>
                    <div className="text-sm font-semibold text-white">Bank details</div>
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
                    <div className="text-sm font-semibold text-white">Payment reference</div>
                    <div className="mt-2 text-sm leading-7 text-white/62">{paymentDetails.transactionValueHint}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ApplyForm rooms={signupRooms} viewer={viewer} />
      </section>
    </PublicShell>
  );
}
