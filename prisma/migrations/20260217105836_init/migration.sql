-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'IN_REVIEW', 'NEED_INFO', 'CONTACTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FinancingStatus" AS ENUM ('NEW', 'QUALIFYING', 'DOCUMENTS_PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'FUNDED');

-- CreateEnum
CREATE TYPE "ApplicationTopic" AS ENUM ('LEASING', 'FUEL', 'VEHICLE', 'CAREER', 'OTHER');

-- CreateEnum
CREATE TYPE "DealerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN', 'YASKRAVA_MANAGER');

-- CreateEnum
CREATE TYPE "DealerMembershipRole" AS ENUM ('DEALER_OWNER', 'DEALER_MANAGER', 'DEALER_SALES');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'DEALER_PROVISIONED', 'APPLICATION_CREATED', 'APPLICATION_STATUS_UPDATED', 'FINANCING_STATUS_UPDATED', 'APPLICATION_ARCHIVED', 'APPLICATION_NOTE_UPDATED', 'APPLICATION_SOFT_DELETED', 'VEHICLE_CREATED', 'VEHICLE_UPDATED', 'VEHICLE_ARCHIVED');

-- CreateEnum
CREATE TYPE "VehicleAvailability" AS ENUM ('IN_TRANSIT', 'ON_SITE', 'SOLD');

-- CreateTable
CREATE TABLE "Dealer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "status" "DealerStatus" NOT NULL DEFAULT 'ACTIVE',
    "defaultLocale" TEXT NOT NULL DEFAULT 'en',
    "accentColor" TEXT NOT NULL DEFAULT '#08D96E',
    "brandPrimary" TEXT NOT NULL DEFAULT 'YASK',
    "brandSecondary" TEXT NOT NULL DEFAULT 'RAVA',
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'CZ',
    "websiteTitle" TEXT,
    "footerDisclaimer" TEXT,
    "appStoreUrl" TEXT,
    "playStoreUrl" TEXT,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerDomain" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hostname" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "DomainStatus" NOT NULL DEFAULT 'ACTIVE',
    "dealerId" TEXT NOT NULL,

    CONSTRAINT "DealerDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "platformRole" "PlatformRole",

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerMembership" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "DealerMembershipRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,

    CONSTRAINT "DealerMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactedAt" TIMESTAMP(3),
    "decisionAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "locale" TEXT NOT NULL,
    "sourceDomain" TEXT NOT NULL,
    "sourcePath" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "message" TEXT,
    "consent" BOOLEAN NOT NULL,
    "calculator" JSONB,
    "topic" "ApplicationTopic" NOT NULL DEFAULT 'LEASING',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "financingStatus" "FinancingStatus" NOT NULL DEFAULT 'NEW',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT,
    "dealerNote" TEXT,
    "dealerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "assignedDealerUserId" TEXT,
    "assignedYaskravaUserId" TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "availability" "VehicleAvailability" NOT NULL DEFAULT 'IN_TRANSIT',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "leasingEligible" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "stockNumber" TEXT,
    "title" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "mileageKm" INTEGER,
    "fuel" TEXT,
    "transmission" TEXT,
    "priceCzk" INTEGER,
    "description" TEXT,
    "imageUrl" TEXT,
    "vinLast6" TEXT,
    "dealerId" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleImage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VehicleImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingCase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "FinancingStatus" NOT NULL DEFAULT 'NEW',
    "lenderName" TEXT,
    "requestedAmountCzk" INTEGER,
    "approvedAmountCzk" INTEGER,
    "monthlyPaymentCzk" INTEGER,
    "decisionNote" TEXT,
    "applicationId" TEXT NOT NULL,
    "assignedYaskravaUserId" TEXT,

    CONSTRAINT "FinancingCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "AuditAction" NOT NULL,
    "actorType" "AuditActorType" NOT NULL DEFAULT 'USER',
    "message" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "actorUserId" TEXT,
    "dealerId" TEXT,
    "applicationId" TEXT,
    "vehicleId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dealer_slug_key" ON "Dealer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DealerDomain_hostname_key" ON "DealerDomain"("hostname");

-- CreateIndex
CREATE INDEX "DealerDomain_dealerId_idx" ON "DealerDomain"("dealerId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "DealerMembership_dealerId_idx" ON "DealerMembership"("dealerId");

-- CreateIndex
CREATE UNIQUE INDEX "DealerMembership_userId_dealerId_key" ON "DealerMembership"("userId", "dealerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "Application_dealerId_createdAt_idx" ON "Application"("dealerId", "createdAt");

-- CreateIndex
CREATE INDEX "Application_dealerId_status_idx" ON "Application"("dealerId", "status");

-- CreateIndex
CREATE INDEX "Application_dealerId_financingStatus_idx" ON "Application"("dealerId", "financingStatus");

-- CreateIndex
CREATE INDEX "Application_dealerId_archived_deletedAt_idx" ON "Application"("dealerId", "archived", "deletedAt");

-- CreateIndex
CREATE INDEX "Vehicle_dealerId_availability_idx" ON "Vehicle"("dealerId", "availability");

-- CreateIndex
CREATE INDEX "Vehicle_dealerId_published_deletedAt_idx" ON "Vehicle"("dealerId", "published", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_dealerId_slug_key" ON "Vehicle"("dealerId", "slug");

-- CreateIndex
CREATE INDEX "VehicleImage_vehicleId_sortOrder_idx" ON "VehicleImage"("vehicleId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FinancingCase_applicationId_key" ON "FinancingCase"("applicationId");

-- CreateIndex
CREATE INDEX "AuditLog_dealerId_createdAt_idx" ON "AuditLog"("dealerId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_applicationId_createdAt_idx" ON "AuditLog"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_vehicleId_createdAt_idx" ON "AuditLog"("vehicleId", "createdAt");

-- AddForeignKey
ALTER TABLE "DealerDomain" ADD CONSTRAINT "DealerDomain_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerMembership" ADD CONSTRAINT "DealerMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerMembership" ADD CONSTRAINT "DealerMembership_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_assignedDealerUserId_fkey" FOREIGN KEY ("assignedDealerUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_assignedYaskravaUserId_fkey" FOREIGN KEY ("assignedYaskravaUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingCase" ADD CONSTRAINT "FinancingCase_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingCase" ADD CONSTRAINT "FinancingCase_assignedYaskravaUserId_fkey" FOREIGN KEY ("assignedYaskravaUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
