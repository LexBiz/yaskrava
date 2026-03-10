-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'VACANCY_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'VACANCY_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'VACANCY_ARCHIVED';

-- CreateTable
CREATE TABLE "Vacancy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "city" TEXT,
    "employmentType" TEXT,
    "description" TEXT,
    "contactEmail" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "dealerId" TEXT NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vacancy_dealerId_published_deletedAt_sortOrder_idx"
ON "Vacancy"("dealerId", "published", "deletedAt", "sortOrder");

-- AddForeignKey
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_dealerId_fkey"
  FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
