-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "recipientEmail" DROP NOT NULL;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "isUnrouted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "AssessmentQuestion" ADD COLUMN IF NOT EXISTS "scoringMode" TEXT NOT NULL DEFAULT 'ALL_OR_NOTHING';
