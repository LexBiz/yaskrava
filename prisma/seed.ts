import "dotenv/config";

import {PrismaPg} from "@prisma/adapter-pg";
import {hash} from "bcryptjs";

import {PrismaClient} from "../src/generated/prisma/client";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/yaskrava?schema=public",
    }),
  });

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@yaskrava.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const dealerOwnerEmail = (process.env.DEALER_OWNER_EMAIL || "dealer@yaskrava.local").toLowerCase();
  const dealerOwnerPassword = process.env.DEALER_OWNER_PASSWORD || "ChangeMe123!";

  const [adminPasswordHash, dealerOwnerPasswordHash] = await Promise.all([
    hash(adminPassword, 12),
    hash(dealerOwnerPassword, 12),
  ]);

  const dealer = await prisma.dealer.upsert({
    where: {slug: "yaskrava"},
    update: {
      name: "Yaskrava",
      legalName: "Yaskrava s.r.o.",
      supportEmail: "info@yaskrava.cz",
      supportPhone: "+420 000 000 000",
      city: "Prague",
      websiteTitle: "Yaskrava",
      footerDisclaimer:
        "Leasing and financing offers are subject to partner approval and legal review.",
      appStoreUrl:
        process.env.NEXT_PUBLIC_APP_STORE_URL ||
        "https://apps.apple.com/cz/app/yaskrava/id1632600122?l=cs",
      playStoreUrl:
        process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
        "https://play.google.com/store/apps/details?id=com.yaskrava",
    },
    create: {
      slug: "yaskrava",
      name: "Yaskrava",
      legalName: "Yaskrava s.r.o.",
      supportEmail: "info@yaskrava.cz",
      supportPhone: "+420 000 000 000",
      city: "Prague",
      websiteTitle: "Yaskrava",
      footerDisclaimer:
        "Leasing and financing offers are subject to partner approval and legal review.",
      appStoreUrl:
        process.env.NEXT_PUBLIC_APP_STORE_URL ||
        "https://apps.apple.com/cz/app/yaskrava/id1632600122?l=cs",
      playStoreUrl:
        process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
        "https://play.google.com/store/apps/details?id=com.yaskrava",
    },
  });

  await prisma.dealerDomain.upsert({
    where: {hostname: "localhost"},
    update: {
      dealerId: dealer.id,
      isPrimary: true,
    },
    create: {
      hostname: "localhost",
      dealerId: dealer.id,
      isPrimary: true,
    },
  });

  await prisma.dealerDomain.upsert({
    where: {hostname: "127.0.0.1"},
    update: {
      dealerId: dealer.id,
    },
    create: {
      hostname: "127.0.0.1",
      dealerId: dealer.id,
    },
  });

  await prisma.dealerDomain.upsert({
    where: {hostname: process.env.PLATFORM_ROOT_DOMAIN || "yaskrava.temoweb.eu"},
    update: {
      dealerId: dealer.id,
    },
    create: {
      hostname: process.env.PLATFORM_ROOT_DOMAIN || "yaskrava.temoweb.eu",
      dealerId: dealer.id,
    },
  });

  await prisma.adminUser.upsert({
    where: {email: adminEmail},
    update: {
      passwordHash: adminPasswordHash,
      platformRole: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      platformRole: "SUPER_ADMIN",
      firstName: "Yaskrava",
      lastName: "Admin",
    },
  });

  const dealerOwner = await prisma.adminUser.upsert({
    where: {email: dealerOwnerEmail},
    update: {
      passwordHash: dealerOwnerPasswordHash,
      isActive: true,
    },
    create: {
      email: dealerOwnerEmail,
      passwordHash: dealerOwnerPasswordHash,
      firstName: "Dealer",
      lastName: "Owner",
    },
  });

  await prisma.dealerMembership.upsert({
    where: {
      userId_dealerId: {
        userId: dealerOwner.id,
        dealerId: dealer.id,
      },
    },
    update: {
      role: "DEALER_OWNER",
      isActive: true,
    },
    create: {
      userId: dealerOwner.id,
      dealerId: dealer.id,
      role: "DEALER_OWNER",
    },
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

