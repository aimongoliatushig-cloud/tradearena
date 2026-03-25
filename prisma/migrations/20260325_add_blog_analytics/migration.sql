-- CreateEnum
CREATE TYPE "BlogAnalyticsEventType" AS ENUM ('FULL_READ', 'POPUP_SHOWN');

-- CreateTable
CREATE TABLE "BlogPostAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "popupId" TEXT,
    "eventType" "BlogAnalyticsEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "readerKey" TEXT NOT NULL,
    "readerName" TEXT,
    "readerEmail" TEXT,
    "clerkUserId" TEXT,
    "anonymousId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,

    CONSTRAINT "BlogPostAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPostAnalyticsEvent_postId_eventType_occurredAt_idx" ON "BlogPostAnalyticsEvent"("postId", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "BlogPostAnalyticsEvent_popupId_eventType_occurredAt_idx" ON "BlogPostAnalyticsEvent"("popupId", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "BlogPostAnalyticsEvent_readerKey_eventType_occurredAt_idx" ON "BlogPostAnalyticsEvent"("readerKey", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "BlogPostAnalyticsEvent_clerkUserId_occurredAt_idx" ON "BlogPostAnalyticsEvent"("clerkUserId", "occurredAt");

-- CreateIndex
CREATE INDEX "BlogPostAnalyticsEvent_occurredAt_eventType_idx" ON "BlogPostAnalyticsEvent"("occurredAt", "eventType");

-- AddForeignKey
ALTER TABLE "BlogPostAnalyticsEvent" ADD CONSTRAINT "BlogPostAnalyticsEvent_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostAnalyticsEvent" ADD CONSTRAINT "BlogPostAnalyticsEvent_popupId_fkey" FOREIGN KEY ("popupId") REFERENCES "BlogPopup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
