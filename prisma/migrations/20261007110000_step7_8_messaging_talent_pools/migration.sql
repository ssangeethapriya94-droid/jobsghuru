-- CreateTable ApplicationMessage
CREATE TABLE IF NOT EXISTS "ApplicationMessage" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable TalentPool
CREATE TABLE IF NOT EXISTS "TalentPool" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable TalentPoolMember
CREATE TABLE IF NOT EXISTS "TalentPoolMember" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "candidateId" TEXT,
    "applicationId" TEXT,
    "candidateName" TEXT NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "notes" TEXT,
    "addedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentPoolMember_pkey" PRIMARY KEY ("id")
);

-- Indexes and Constraints
CREATE INDEX IF NOT EXISTS "ApplicationMessage_applicationId_createdAt_idx" ON "ApplicationMessage"("applicationId", "createdAt");
CREATE INDEX IF NOT EXISTS "ApplicationMessage_companyId_idx" ON "ApplicationMessage"("companyId");
CREATE INDEX IF NOT EXISTS "TalentPool_companyId_idx" ON "TalentPool"("companyId");
CREATE UNIQUE INDEX IF NOT EXISTS "TalentPoolMember_poolId_candidateEmail_key" ON "TalentPoolMember"("poolId", "candidateEmail");
CREATE INDEX IF NOT EXISTS "TalentPoolMember_poolId_idx" ON "TalentPoolMember"("poolId");

-- Foreign Keys
ALTER TABLE "ApplicationMessage" ADD CONSTRAINT "ApplicationMessage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationMessage" ADD CONSTRAINT "ApplicationMessage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TalentPool" ADD CONSTRAINT "TalentPool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TalentPoolMember" ADD CONSTRAINT "TalentPoolMember_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "TalentPool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TalentPoolMember" ADD CONSTRAINT "TalentPoolMember_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TalentPoolMember" ADD CONSTRAINT "TalentPoolMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
