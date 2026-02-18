import "dotenv/config";

import {PrismaBetterSqlite3} from "@prisma/adapter-better-sqlite3";

import {PrismaClient} from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./dev.db",
  });

  const prisma = new PrismaClient({adapter});

  const vehicleCount = await prisma.vehicle.count();
  if (vehicleCount === 0) {
    await prisma.vehicle.createMany({
      data: [
        {
          availability: "IN_TRANSIT",
          title: "Škoda Octavia • 2020 • 1.6 TDI",
          make: "Škoda",
          model: "Octavia",
          year: 2020,
          mileageKm: 98000,
          fuel: "Diesel",
          transmission: "Automatic",
          priceCzk: 379000,
          description: "In transit to the площадка. Details on request.",
        },
        {
          availability: "IN_TRANSIT",
          title: "Volkswagen Golf • 2019 • 1.5 TSI",
          make: "Volkswagen",
          model: "Golf",
          year: 2019,
          mileageKm: 76000,
          fuel: "Petrol",
          transmission: "Automatic",
          priceCzk: 359000,
          description: "In transit to the площадка. Details on request.",
        },
        {
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
        }
      ],
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

