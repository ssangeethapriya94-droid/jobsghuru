-- AlterTable
ALTER TABLE "EmailOutbox" ADD COLUMN "companyId" TEXT,
ADD COLUMN "applicationId" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "applicationId" TEXT;

-- CreateIndex
CREATE INDEX "EmailOutbox_companyId_idx" ON "EmailOutbox"("companyId");

-- CreateIndex
CREATE INDEX "EmailOutbox_applicationId_idx" ON "EmailOutbox"("applicationId");

-- CreateIndex
CREATE INDEX "Notification_applicationId_idx" ON "Notification"("applicationId");

-- AddForeignKey
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "EmailOutbox_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "EmailOutbox_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Safe Data Backfill:
-- 1. Backfill applicationId for EmailOutbox where payload contains applicationId
UPDATE "EmailOutbox" e
SET "applicationId" = (e.payload->>'applicationId')
WHERE e."applicationId" IS NULL 
  AND e.payload IS NOT NULL 
  AND (e.payload->>'applicationId') IS NOT NULL
  AND EXISTS (SELECT 1 FROM "Application" a WHERE a.id = (e.payload->>'applicationId'));

-- 2. Backfill companyId for EmailOutbox from Application.job.companyId
UPDATE "EmailOutbox" e
SET "companyId" = j."companyId"
FROM "Application" a
JOIN "Job" j ON a."jobId" = j.id
WHERE e."applicationId" = a.id AND e."companyId" IS NULL;

-- 3. Backfill Notification applicationId if link matches application URL pattern
UPDATE "Notification" n
SET "applicationId" = SUBSTRING(n.link FROM '/applications/([^/?]+)')
WHERE n."applicationId" IS NULL 
  AND n.link LIKE '%/applications/%'
  AND EXISTS (SELECT 1 FROM "Application" a WHERE a.id = SUBSTRING(n.link FROM '/applications/([^/?]+)'));
