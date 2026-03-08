-- CreateEnum
CREATE TYPE "PartnerLeadStatus" AS ENUM ('NEW', 'IN_REVIEW', 'CONTACTED', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PARTNER_LEAD_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PARTNER_LEAD_STATUS_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PARTNER_LEAD_ARCHIVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PARTNER_LEAD_NOTE_UPDATED';

-- CreateTable
CREATE TABLE "PartnerLead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactedAt" TIMESTAMP(3),
    "decisionAt" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "sourceDomain" TEXT NOT NULL,
    "sourcePath" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "city" TEXT,
    "website" TEXT,
    "fleetSize" TEXT,
    "message" TEXT,
    "status" "PartnerLeadStatus" NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "convertedDealerId" TEXT,

    CONSTRAINT "PartnerLead_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN "partnerLeadId" TEXT;

-- CreateIndex
CREATE INDEX "PartnerLead_status_createdAt_idx" ON "PartnerLead"("status", "createdAt");
CREATE INDEX "PartnerLead_archived_deletedAt_idx" ON "PartnerLead"("archived", "deletedAt");
CREATE INDEX "PartnerLead_convertedDealerId_idx" ON "PartnerLead"("convertedDealerId");
CREATE INDEX "AuditLog_partnerLeadId_createdAt_idx" ON "AuditLog"("partnerLeadId", "createdAt");

-- AddForeignKey
ALTER TABLE "PartnerLead" ADD CONSTRAINT "PartnerLead_convertedDealerId_fkey"
  FOREIGN KEY ("convertedDealerId") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_partnerLeadId_fkey"
  FOREIGN KEY ("partnerLeadId") REFERENCES "PartnerLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
