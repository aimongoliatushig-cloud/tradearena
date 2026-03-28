export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ArrowRight, Users } from "lucide-react";

import { ApplyForm } from "@/components/forms/apply-form";
import { PublicShell } from "@/components/layout/public-shell";
import { buttonVariants } from "@/lib/button-variants";
import { accountSizeLabels } from "@/lib/labels";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { listSignupRooms } from "@/server/services/room-service";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requestedRoomId = typeof params.roomId === "string" ? params.roomId : undefined;
  const rooms = await listSignupRooms();
  const preferredRoom = requestedRoomId ? rooms.find((room) => room.id === requestedRoomId) ?? null : null;
  const { userId } = await auth();
  const viewer = userId ? await currentUser() : null;
  const viewerProfile = viewer
    ? {
        email: viewer.primaryEmailAddress?.emailAddress ?? "",
        fullName: [viewer.firstName, viewer.lastName].filter(Boolean).join(" ") || viewer.username || "",
      }
    : null;
  const returnBackUrl = preferredRoom ? `/apply?roomId=${preferredRoom.id}` : "/apply";

  return (
    <PublicShell>
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-panel p-6 sm:p-8">
          <div className="ftmo-kicker">Challenge Signup</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Өрөөндөө бүртгүүлээд дарааллаа шууд хар
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            Account size бүр дээр нийт active signup хэд байгааг, username жагсаалттай нь харж болно. Бүртгүүлэх товч нь
            тухайн size-ийн одоо нээлттэй room руу шууд холбоно.
          </p>

          {preferredRoom ? (
            <div className="mt-6 flex items-start gap-3 rounded-[1.6rem] border border-[#2dd0b1]/20 bg-[#18c7a2]/8 p-4 text-sm text-white/72">
              <Users className="mt-0.5 size-5 text-[#8de8d2]" />
              <div>
                <div className="font-medium text-white">Сонгосон room</div>
                <div className="mt-1">
                  {accountSizeLabels[preferredRoom.accountSize]} · {formatUsd(preferredRoom.entryFeeUsd)} · {preferredRoom.title}
                </div>
                <div className="mt-1 text-xs text-white/56">Нийт active signup: {preferredRoom.activeApplicantCount} хүн</div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {rooms.map((room) => {
              const isSelected = preferredRoom?.id === room.id;

              return (
                <div key={room.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">
                        {accountSizeLabels[room.accountSize]} · {formatUsd(room.entryFeeUsd)}
                      </div>
                      <div className="mt-1 text-xs text-white/56">{room.title}</div>
                      <div className="mt-1 text-xs text-white/46">Нийт active signup: {room.activeApplicantCount} хүн</div>
                    </div>
                    <Link
                      href={`/apply?roomId=${room.id}`}
                      className={cn(
                        buttonVariants({ size: "sm", variant: isSelected ? "secondary" : "outline" }),
                        isSelected ? "border-[#2dd0b1]/40" : "border-white/12",
                      )}
                    >
                      Сонгох
                    </Link>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {room.applicants.length ? (
                      room.applicants.map((applicant) => (
                        <span
                          key={applicant.id}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70"
                        >
                          {applicant.username}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/46">Одоогоор бүртгэл алга.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-white/56 transition hover:text-white">
            Нүүр хуудас руу буцах
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ApplyForm rooms={rooms} viewer={viewerProfile} preferredRoomId={preferredRoom?.id} returnBackUrl={returnBackUrl} />
      </section>
    </PublicShell>
  );
}
