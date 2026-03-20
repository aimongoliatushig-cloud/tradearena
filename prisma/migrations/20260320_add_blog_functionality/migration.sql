-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountSize" AS ENUM ('SIZE_10K', 'SIZE_25K', 'SIZE_50K', 'SIZE_100K', 'SIZE_200K');

-- CreateEnum
CREATE TYPE "ChallengeStep" AS ENUM ('STEP_1', 'STEP_2');

-- CreateEnum
CREATE TYPE "RoomPublicStatus" AS ENUM ('PUBLIC', 'HIDDEN');

-- CreateEnum
CREATE TYPE "RoomLifecycleStatus" AS ENUM ('SIGNUP_OPEN', 'READY_TO_START', 'ACTIVE', 'EXPIRED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'ASSIGNED', 'INVITATION_SENT', 'JOINED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('SCHEDULED_ROOM_UPDATE', 'MANUAL_TRADER_REFRESH', 'MANUAL_ROOM_REFRESH', 'ROOM_STATUS_SYNC');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL', 'SKIPPED');

-- CreateEnum
CREATE TYPE "FetchSource" AS ENUM ('SCHEDULER', 'MANUAL', 'API');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('ROOM_INVITATION', 'ROOM_READY', 'GENERAL_UPDATE');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeRoom" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "accountSize" "AccountSize" NOT NULL,
    "step" "ChallengeStep" NOT NULL,
    "entryFeeUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "publicStatus" "RoomPublicStatus" NOT NULL DEFAULT 'PUBLIC',
    "lifecycleStatus" "RoomLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "maxTraderCapacity" INTEGER NOT NULL DEFAULT 10,
    "updateTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updateTimezone" TEXT NOT NULL DEFAULT 'Asia/Ulaanbaatar',
    "allowExpiredUpdates" BOOLEAN NOT NULL DEFAULT false,
    "leaderTraderId" TEXT,
    "winnerTraderId" TEXT,
    "winnerDeclaredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trader" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "metrixUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "currentProfitPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentProfitAbsolute" DOUBLE PRECISION,
    "currentDailyLossValue" DOUBLE PRECISION,
    "currentMaxLossValue" DOUBLE PRECISION,
    "currentBalance" DOUBLE PRECISION,
    "currentEquity" DOUBLE PRECISION,
    "violationFlag" BOOLEAN NOT NULL DEFAULT false,
    "violationReason" TEXT,
    "completionRecorded" BOOLEAN NOT NULL DEFAULT false,
    "rank" INTEGER,
    "latestSnapshotAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraderSnapshot" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profitPercent" DOUBLE PRECISION NOT NULL,
    "profitAbsolute" DOUBLE PRECISION,
    "dailyLossValue" DOUBLE PRECISION,
    "maxLossValue" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION,
    "equity" DOUBLE PRECISION,
    "statusNotes" TEXT,
    "rawPayload" JSONB,

    CONSTRAINT "TraderSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT,
    "clerkUserId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "desiredAccountSize" "AccountSize" NOT NULL,
    "note" TEXT,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'PENDING',
    "invitationSentAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDispatch" (
    "id" TEXT NOT NULL,
    "roomId" TEXT,
    "applicantId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRunLog" (
    "id" TEXT NOT NULL,
    "roomId" TEXT,
    "traderId" TEXT,
    "jobType" "JobType" NOT NULL,
    "source" "FetchSource" NOT NULL DEFAULT 'SCHEDULER',
    "status" "JobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "details" JSONB,

    CONSTRAINT "JobRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SubmissionAttempt" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPopup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "ctaLabel" TEXT NOT NULL,
    "ctaUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPopup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "requiresLoginForFullRead" BOOLEAN NOT NULL DEFAULT false,
    "showEndPopup" BOOLEAN NOT NULL DEFAULT false,
    "popupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_expiresAt_idx" ON "AdminSession"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeRoom_slug_key" ON "ChallengeRoom"("slug");

-- CreateIndex
CREATE INDEX "ChallengeRoom_lifecycleStatus_startDate_idx" ON "ChallengeRoom"("lifecycleStatus", "startDate");

-- CreateIndex
CREATE INDEX "ChallengeRoom_accountSize_step_idx" ON "ChallengeRoom"("accountSize", "step");

-- CreateIndex
CREATE UNIQUE INDEX "Trader_metrixUrl_key" ON "Trader"("metrixUrl");

-- CreateIndex
CREATE INDEX "Trader_roomId_rank_idx" ON "Trader"("roomId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "Trader_roomId_fullName_key" ON "Trader"("roomId", "fullName");

-- CreateIndex
CREATE INDEX "TraderSnapshot_traderId_fetchedAt_idx" ON "TraderSnapshot"("traderId", "fetchedAt");

-- CreateIndex
CREATE INDEX "Applicant_desiredAccountSize_status_idx" ON "Applicant"("desiredAccountSize", "status");

-- CreateIndex
CREATE INDEX "Applicant_clerkUserId_desiredAccountSize_status_idx" ON "Applicant"("clerkUserId", "desiredAccountSize", "status");

-- CreateIndex
CREATE INDEX "Applicant_roomId_status_idx" ON "Applicant"("roomId", "status");

-- CreateIndex
CREATE INDEX "Applicant_email_createdAt_idx" ON "Applicant"("email", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDispatch_channel_status_createdAt_idx" ON "NotificationDispatch"("channel", "status", "createdAt");

-- CreateIndex
CREATE INDEX "JobRunLog_status_startedAt_idx" ON "JobRunLog"("status", "startedAt");

-- CreateIndex
CREATE INDEX "JobRunLog_roomId_startedAt_idx" ON "JobRunLog"("roomId", "startedAt");

-- CreateIndex
CREATE INDEX "JobRunLog_traderId_startedAt_idx" ON "JobRunLog"("traderId", "startedAt");

-- CreateIndex
CREATE INDEX "SubmissionAttempt_route_ipAddress_createdAt_idx" ON "SubmissionAttempt"("route", "ipAddress", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_sortOrder_name_idx" ON "BlogCategory"("sortOrder", "name");

-- CreateIndex
CREATE INDEX "BlogPopup_isActive_updatedAt_idx" ON "BlogPopup"("isActive", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_categoryId_publishedAt_idx" ON "BlogPost"("categoryId", "publishedAt");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeRoom" ADD CONSTRAINT "ChallengeRoom_leaderTraderId_fkey" FOREIGN KEY ("leaderTraderId") REFERENCES "Trader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeRoom" ADD CONSTRAINT "ChallengeRoom_winnerTraderId_fkey" FOREIGN KEY ("winnerTraderId") REFERENCES "Trader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trader" ADD CONSTRAINT "Trader_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChallengeRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraderSnapshot" ADD CONSTRAINT "TraderSnapshot_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "Trader"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChallengeRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDispatch" ADD CONSTRAINT "NotificationDispatch_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChallengeRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDispatch" ADD CONSTRAINT "NotificationDispatch_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRunLog" ADD CONSTRAINT "JobRunLog_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChallengeRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRunLog" ADD CONSTRAINT "JobRunLog_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "Trader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_popupId_fkey" FOREIGN KEY ("popupId") REFERENCES "BlogPopup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

