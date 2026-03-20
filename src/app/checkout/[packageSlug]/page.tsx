export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { PublicShell } from "@/components/layout/public-shell";
import { ClerkPromptActions } from "@/components/shared/clerk-auth-controls";
import { FlashMessage } from "@/components/shared/flash-message";
import { buttonVariants } from "@/lib/button-variants";
import { packageEnrollmentStatusLabels, paymentStatusLabels } from "@/lib/labels";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { submitManualPaymentAction } from "@/server/actions/member-actions";
import { createCheckoutEnrollment } from "@/server/services/enrollment-service";
import { getPackageTierBySlug } from "@/server/services/package-service";
import { getPaymentDetailsConfig } from "@/server/services/settings-service";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ packageSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { packageSlug } = await params;
  const flash = await searchParams;
  const packageTier = await getPackageTierBySlug(packageSlug);

  if (!packageTier) {
    notFound();
  }

  const { userId } = await auth();
  const paymentDetails = await getPaymentDetailsConfig();

  if (!userId) {
    return (
      <PublicShell>
        <section className="mx-auto max-w-3xl space-y-6">
          <div className="glass-panel p-8">
            <div className="ftmo-kicker">Төлбөр ба элсэлт</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">{packageTier.nameMn}</h1>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Энэ багцыг сонгохын тулд эхлээд нэвтэрч, дараа нь төлбөрийн мэдээллээ илгээнэ.
            </p>
            <ClerkPromptActions
              containerClassName="mt-6"
              returnBackUrl={`/checkout/${packageTier.slug}`}
              signUpClassName={cn(buttonVariants({ variant: "outline" }), "border-white/12 text-white")}
            />
          </div>
        </section>
      </PublicShell>
    );
  }

  const user = await currentUser();

  let enrollmentError: string | null = null;
  let enrollment:
    | Awaited<ReturnType<typeof createCheckoutEnrollment>>
    | null = null;

  try {
    enrollment = await createCheckoutEnrollment({
      clerkUserId: userId,
      packageSlug,
      customerName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || undefined,
      customerEmail: user?.primaryEmailAddress?.emailAddress || undefined,
    });
  } catch (error) {
    enrollmentError = error instanceof Error ? error.message : "Төлбөрийн хуудсыг нээх үед алдаа гарлаа.";
  }

  return (
    <PublicShell>
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="glass-panel p-8">
            <div className="ftmo-kicker">Сонгосон багц</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">{packageTier.nameMn}</h1>
            <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">{formatUsd(packageTier.priceUsd)}</div>
            <ul className="mt-6 space-y-2 text-sm text-white/68">
              {packageTier.featuresMn.map((feature) => (
                <li key={feature} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-6">
            <div className="ftmo-kicker">Төлбөрийн мэдээлэл</div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/70">
              <div>
                <div className="text-white">Банк</div>
                <div>{paymentDetails.bankName}</div>
              </div>
              <div>
                <div className="text-white">Хүлээн авагч</div>
                <div>{paymentDetails.accountHolder}</div>
              </div>
              <div>
                <div className="text-white">Данс</div>
                <div>{paymentDetails.accountNumber}</div>
              </div>
              <div>
                <div className="text-white">Гүйлгээний утга</div>
                <div>{paymentDetails.transactionValueHint}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <FlashMessage
            success={typeof flash.success === "string" ? flash.success : undefined}
            error={typeof flash.error === "string" ? flash.error : undefined}
          />

          {enrollmentError ? (
            <div className="glass-panel p-8">
              <h2 className="text-2xl font-semibold text-white">Төлбөрийн хуудсыг үргэлжлүүлэх боломжгүй</h2>
              <p className="mt-3 text-sm leading-7 text-rose-200/90">{enrollmentError}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard" className={buttonVariants()}>
                  Хяналтын самбар
                </Link>
                <Link href="/packages" className={buttonVariants({ variant: "outline" })}>
                  Багцууд руу буцах
                </Link>
              </div>
            </div>
          ) : enrollment ? (
            <div className="glass-panel p-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
                  Элсэлтийн төлөв: {packageEnrollmentStatusLabels[enrollment.status]}
                </div>
                {enrollment.payment ? (
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
                    Төлбөр: {paymentStatusLabels[enrollment.payment.status]}
                  </div>
                ) : null}
              </div>

              {enrollment.status === "ENROLLED" ? (
                <div className="mt-6 space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Энэ багц аль хэдийн идэвхтэй байна</h2>
                  <p className="text-sm leading-7 text-white/60">
                    Таны эрх нээгдсэн байна. Доорх товчоор хяналтын самбар руу орно уу.
                  </p>
                  <Link href="/dashboard" className={buttonVariants()}>
                    Хяналтын самбар
                  </Link>
                </div>
              ) : enrollment.status === "PENDING_CONFIRMATION" ? (
                <div className="mt-6 space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Төлбөрийг шалгаж байна</h2>
                  <p className="text-sm leading-7 text-white/60">
                    Таны илгээсэн reference болон нотолгоог админ шалгаж байна. Баталгаажмагц багцын эрх
                    автоматаар нээгдэнэ.
                  </p>
                  <Link href="/dashboard" className={buttonVariants()}>
                    Хяналтын самбар
                  </Link>
                </div>
              ) : (
                <form action={submitManualPaymentAction} className="mt-6 space-y-4">
                  <input type="hidden" name="enrollmentId" value={enrollment.id} />
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Гүйлгээний утга / reference</label>
                    <input
                      name="reference"
                      defaultValue={enrollment.payment?.reference ?? ""}
                      className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
                      placeholder="Жишээ: 10K Багц - Бат"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Нэмэлт тайлбар</label>
                    <textarea
                      name="proofNote"
                      defaultValue={enrollment.payment?.proofNote ?? ""}
                      rows={4}
                      className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
                      placeholder="Хэзээ шилжүүлсэн, аль данснаас илгээсэн зэрэг нэмэлт мэдээлэл"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Нотолгооны холбоос (заавал биш)</label>
                    <input
                      name="proofUrl"
                      defaultValue={enrollment.payment?.proofUrl ?? ""}
                      className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white/62">
                    Төлбөрийн мэдээллийг илгээсний дараа админ баталгаажуулж, өрөө болон бүх эрх автоматаар
                    нээгдэнэ.
                  </div>
                  <button type="submit" className={cn(buttonVariants(), "w-full justify-center rounded-[1.2rem]")}>
                    Төлбөрийн мэдээлэл илгээх
                  </button>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </PublicShell>
  );
}
