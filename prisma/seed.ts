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

  const vehicleCount = await prisma.vehicle.count({
    where: {dealerId: dealer.id},
  });

  if (vehicleCount === 0) {
    await prisma.vehicle.createMany({
      data: [
        {
          dealerId: dealer.id,
          slug: "skoda-octavia-2020-tdi",
          availability: "IN_TRANSIT",
          title: "Škoda Octavia • 2020 • 1.6 TDI",
          make: "Škoda",
          model: "Octavia",
          year: 2020,
          mileageKm: 98000,
          fuel: "Diesel",
          transmission: "Automatic",
          priceCzk: 379000,
          description: "In transit to the dealer site. Details on request.",
        },
        {
          dealerId: dealer.id,
          slug: "volkswagen-golf-2019-tsi",
          availability: "IN_TRANSIT",
          title: "Volkswagen Golf • 2019 • 1.5 TSI",
          make: "Volkswagen",
          model: "Golf",
          year: 2019,
          mileageKm: 76000,
          fuel: "Petrol",
          transmission: "Automatic",
          priceCzk: 359000,
          description: "In transit to the dealer site. Details on request.",
        },
        {
          dealerId: dealer.id,
          slug: "toyota-corolla-2021-hybrid",
          availability: "ON_SITE",
          title: "Toyota Corolla • 2021 • Hybrid",
          make: "Toyota",
          model: "Corolla",
          year: 2021,
          mileageKm: 52000,
          fuel: "Hybrid",
          transmission: "Automatic",
          priceCzk: 429000,
          description: "Available on site for review.",
        },
        {
          dealerId: dealer.id,
          slug: "hyundai-i30-2020-tgdi",
          availability: "ON_SITE",
          title: "Hyundai i30 • 2020 • 1.4 T-GDI",
          make: "Hyundai",
          model: "i30",
          year: 2020,
          mileageKm: 64000,
          fuel: "Petrol",
          transmission: "Manual",
          priceCzk: 319000,
          description: "Available on site for review.",
        },
      ],
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

