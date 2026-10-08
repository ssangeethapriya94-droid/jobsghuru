-- CreateTable JobAlert
CREATE TABLE IF NOT EXISTS "JobAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT,
    "location" TEXT,
    "jobType" TEXT,
    "minSalary" INTEGER,
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "tokenHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAlert_pkey" PRIMARY KEY ("id")
);

-- Unique & Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "JobAlert_tokenHash_key" ON "JobAlert"("tokenHash");
CREATE INDEX IF NOT EXISTS "JobAlert_userId_idx" ON "JobAlert"("userId");
CREATE INDEX IF NOT EXISTS "JobAlert_tokenHash_idx" ON "JobAlert"("tokenHash");

-- Foreign Keys
ALTER TABLE "JobAlert" ADD CONSTRAINT "JobAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
