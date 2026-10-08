-- AlterTable
ALTER TABLE "Company" ADD COLUMN "autoRejectOnFail" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "AssessmentQuestion" ADD COLUMN "negativePoints" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CandidateAssessment" ADD COLUMN "tokenHash" TEXT,
ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "questionsSnapshot" JSONB,
ADD COLUMN "deadlineAt" TIMESTAMP(3),
ADD COLUMN "reviewerId" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "resultHistory" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateAssessment_tokenHash_key" ON "CandidateAssessment"("tokenHash");

-- CreateIndex
CREATE INDEX "CandidateAssessment_tokenHash_idx" ON "CandidateAssessment"("tokenHash");
