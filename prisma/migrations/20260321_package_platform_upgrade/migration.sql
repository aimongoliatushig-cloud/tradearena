-- CreateEnum
CREATE TYPE "CourseAccessLevel" AS ENUM ('BASIC', 'TRADING_PLAN', 'INTERMEDIATE', 'ADVANCED', 'FULL_ADVANCED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING_SUBMISSION', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PackageEnrollmentStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'ENROLLED', 'AWAITING_DECISION', 'MERGED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentDecisionChoice" AS ENUM ('MERGE', 'WAIT');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('STRATEGY', 'INDICATOR', 'TOOL');

-- CreateEnum
CREATE TYPE "EnrollmentAuditType" AS ENUM ('CREATED', 'PAYMENT_SUBMITTED', 'PAYMENT_CONFIRMED', 'ROOM_ASSIGNED', 'ROOM_MOVED', 'ROOM_MERGED', 'WAIT_SELECTED', 'MERGE_SELECTED', 'CANCELLED', 'NOTE');

-- AlterEnum
ALTER TYPE "RoomLifecycleStatus" ADD VALUE 'AWAITING_DECISION';

-- AlterTable
ALTER TABLE "ChallengeRoom" ADD COLUMN     "decisionDeadlineAt" TIMESTAMP(3),
ADD COLUMN     "isPackageRoom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mergeTargetRoomId" TEXT,
ADD COLUMN     "packageTierId" TEXT,
ADD COLUMN     "roomSequence" INTEGER;

-- CreateTable
CREATE TABLE "PackageTier" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameMn" TEXT NOT NULL,
    "accountSize" "AccountSize" NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "featuresMn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "strategyCount" INTEGER NOT NULL DEFAULT 0,
    "includesCoaching" BOOLEAN NOT NULL DEFAULT false,
    "coachingHours" INTEGER NOT NULL DEFAULT 0,
    "includesIndicators" BOOLEAN NOT NULL DEFAULT false,
    "courseAccessLevel" "CourseAccessLevel" NOT NULL,
    "prioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "packageTierId" TEXT NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING_SUBMISSION',
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reference" TEXT,
    "proofNote" TEXT,
    "proofUrl" TEXT,
    "metadata" JSONB,
    "submittedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageEnrollment" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "packageTierId" TEXT NOT NULL,
    "roomId" TEXT,
    "paymentId" TEXT,
    "status" "PackageEnrollmentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "decisionChoice" "EnrollmentDecisionChoice",
    "unlockedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleMn" TEXT NOT NULL,
    "descriptionMn" TEXT,
    "videoUrl" TEXT,
    "textContent" TEXT,
    "pdfUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePackageTier" (
    "courseId" TEXT NOT NULL,
    "packageTierId" TEXT NOT NULL,

    CONSTRAINT "CoursePackageTier_pkey" PRIMARY KEY ("courseId","packageTierId")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "titleMn" TEXT NOT NULL,
    "descriptionMn" TEXT,
    "type" "ResourceType" NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourcePackageTier" (
    "resourceId" TEXT NOT NULL,
    "packageTierId" TEXT NOT NULL,

    CONSTRAINT "ResourcePackageTier_pkey" PRIMARY KEY ("resourceId","packageTierId")
);

-- CreateTable
CREATE TABLE "CourseProgress" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentAuditLog" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "type" "EnrollmentAuditType" NOT NULL,
    "message" TEXT NOT NULL,
    "actorId" TEXT,
    "fromRoomId" TEXT,
    "toRoomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrollmentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackageTier_slug_key" ON "PackageTier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PackageTier_accountSize_key" ON "PackageTier"("accountSize");

-- CreateIndex
CREATE INDEX "PackageTier_isActive_sortOrder_idx" ON "PackageTier"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "PaymentRecord_clerkUserId_createdAt_idx" ON "PaymentRecord"("clerkUserId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentRecord_status_createdAt_idx" ON "PaymentRecord"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentRecord_packageTierId_createdAt_idx" ON "PaymentRecord"("packageTierId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PackageEnrollment_paymentId_key" ON "PackageEnrollment"("paymentId");

-- CreateIndex
CREATE INDEX "PackageEnrollment_clerkUserId_createdAt_idx" ON "PackageEnrollment"("clerkUserId", "createdAt");

-- CreateIndex
CREATE INDEX "PackageEnrollment_clerkUserId_status_createdAt_idx" ON "PackageEnrollment"("clerkUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PackageEnrollment_roomId_status_idx" ON "PackageEnrollment"("roomId", "status");

-- CreateIndex
CREATE INDEX "PackageEnrollment_packageTierId_status_idx" ON "PackageEnrollment"("packageTierId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_isPublished_sortOrder_idx" ON "Course"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "Resource_type_isPublished_sortOrder_idx" ON "Resource"("type", "isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "CourseProgress_enrollmentId_idx" ON "CourseProgress"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProgress_clerkUserId_courseId_key" ON "CourseProgress"("clerkUserId", "courseId");

-- CreateIndex
CREATE INDEX "EnrollmentAuditLog_enrollmentId_createdAt_idx" ON "EnrollmentAuditLog"("enrollmentId", "createdAt");

-- CreateIndex
CREATE INDEX "ChallengeRoom_isPackageRoom_packageTierId_lifecycleStatus_idx" ON "ChallengeRoom"("isPackageRoom", "packageTierId", "lifecycleStatus");

-- CreateIndex
CREATE INDEX "ChallengeRoom_packageTierId_roomSequence_idx" ON "ChallengeRoom"("packageTierId", "roomSequence");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeRoom_packageTierId_roomSequence_key" ON "ChallengeRoom"("packageTierId", "roomSequence");

-- AddForeignKey
ALTER TABLE "ChallengeRoom" ADD CONSTRAINT "ChallengeRoom_packageTierId_fkey" FOREIGN KEY ("packageTierId") REFERENCES "PackageTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeRoom" ADD CONSTRAINT "ChallengeRoom_mergeTargetRoomId_fkey" FOREIGN KEY ("mergeTargetRoomId") REFERENCES "ChallengeRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_packageTierId_fkey" FOREIGN KEY ("packageTierId") REFERENCES "PackageTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEnrollment" ADD CONSTRAINT "PackageEnrollment_packageTierId_fkey" FOREIGN KEY ("packageTierId") REFERENCES "PackageTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEnrollment" ADD CONSTRAINT "PackageEnrollment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChallengeRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEnrollment" ADD CONSTRAINT "PackageEnrollment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePackageTier" ADD CONSTRAINT "CoursePackageTier_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePackageTier" ADD CONSTRAINT "CoursePackageTier_packageTierId_fkey" FOREIGN KEY ("packageTierId") REFERENCES "PackageTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcePackageTier" ADD CONSTRAINT "ResourcePackageTier_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcePackageTier" ADD CONSTRAINT "ResourcePackageTier_packageTierId_fkey" FOREIGN KEY ("packageTierId") REFERENCES "PackageTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "PackageEnrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentAuditLog" ADD CONSTRAINT "EnrollmentAuditLog_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "PackageEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentAuditLog" ADD CONSTRAINT "EnrollmentAuditLog_fromRoomId_fkey" FOREIGN KEY ("fromRoomId") REFERENCES "ChallengeRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentAuditLog" ADD CONSTRAINT "EnrollmentAuditLog_toRoomId_fkey" FOREIGN KEY ("toRoomId") REFERENCES "ChallengeRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

