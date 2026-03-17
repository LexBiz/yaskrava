/**
 * Full demo seed: 5 dealers + vehicles + financing applications
 * Run: DATABASE_URL="..." npx tsx scripts/seed-demo.ts
 */

import "dotenv/config";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "../src/generated/prisma/client";
import {randomBytes} from "node:crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({adapter: new PrismaPg({connectionString})});
const API_BASE = "http://127.0.0.1:3024";

// ─── helpers ────────────────────────────────────────────────────────────────

function genPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  const buf = randomBytes(18);
  let pwd = "";
  for (const byte of buf) {
    pwd += chars[byte % chars.length];
    if (pwd.length === 14) break;
  }
  return pwd;
}

async function hashPwd(plain: string): Promise<string> {
  const {hash} = await import("bcryptjs");
  return hash(plain, 10);
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── test data ───────────────────────────────────────────────────────────────

const DEALERS = [
  {
    name: "AutoElite Praha",
    slug: "autoelite",
    ownerEmail: "crm@autoelite.demo",
    city: "Praha",
    vehicles: [
      {title: "BMW 330d xDrive · 2022 · M Sport", make: "BMW", model: "330d xDrive", year: 2022, mileageKm: 34500, fuel: "Diesel", transmission: "Automatic", priceCzk: 895000, availability: "ON_SITE" as const},
      {title: "Mercedes-Benz C 220d · 2023 · AMG Line", make: "Mercedes-Benz", model: "C 220d", year: 2023, mileageKm: 11200, fuel: "Diesel", transmission: "Automatic", priceCzk: 1150000, availability: "ON_SITE" as const},
      {title: "Audi A4 45 TFSI · 2021 · S Line", make: "Audi", model: "A4 45 TFSI", year: 2021, mileageKm: 57000, fuel: "Petrol", transmission: "Automatic", priceCzk: 720000, availability: "IN_TRANSIT" as const},
      {title: "Volkswagen Passat 2.0 TDI · 2022 · Elegance", make: "Volkswagen", model: "Passat 2.0 TDI", year: 2022, mileageKm: 28900, fuel: "Diesel", transmission: "Automatic", priceCzk: 640000, availability: "ON_SITE" as const},
    ],
    applicants: [
      {name: "Ondřej Novák", phone: "+420 731 456 789", email: "ondrej.novak@gmail.com", city: "Praha", message: "Mám zájem o BMW 330d, možný test drive?"},
      {name: "Petra Horáková", phone: "+420 605 321 654", email: "petra.horakova@email.cz", city: "Praha", message: "Kalkulace leasingu na Mercedes C 220d prosím"},
      {name: "Martin Blaha", phone: "+420 728 111 999", email: "martin.blaha@seznam.cz", city: "Kladno", message: "Kdy bude dostupné Audi A4?"},
    ],
  },
  {
    name: "AutoMorava Ostrava",
    slug: "automorava",
    ownerEmail: "crm@automorava.demo",
    city: "Ostrava",
    vehicles: [
      {title: "Škoda Superb 2.0 TDI · 2022 · Laurin & Klement", make: "Škoda", model: "Superb 2.0 TDI", year: 2022, mileageKm: 41000, fuel: "Diesel", transmission: "Automatic", priceCzk: 580000, availability: "ON_SITE" as const},
      {title: "Hyundai Tucson 1.6 T-GDI · 2023 · Premium", make: "Hyundai", model: "Tucson 1.6 T-GDI", year: 2023, mileageKm: 8500, fuel: "Hybrid", transmission: "Automatic", priceCzk: 720000, availability: "ON_SITE" as const},
      {title: "Toyota RAV4 2.5 AWD-i · 2022 · Executive", make: "Toyota", model: "RAV4 2.5 AWD-i", year: 2022, mileageKm: 32000, fuel: "Hybrid", transmission: "Automatic", priceCzk: 830000, availability: "IN_TRANSIT" as const},
    ],
    applicants: [
      {name: "Jakub Procházka", phone: "+420 777 321 456", email: "jakub.prochazka@gmail.com", city: "Ostrava", message: "Chci financování Škody Superb na 36 měsíců"},
      {name: "Lucie Dvořáková", phone: "+420 603 654 321", email: "lucie.dvorakova@volny.cz", city: "Olomouc", message: "Toyota RAV4 — je možný odpočet DPH?"},
    ],
  },
  {
    name: "AutoWest Plzeň",
    slug: "autowest",
    ownerEmail: "crm@autowest.demo",
    city: "Plzeň",
    vehicles: [
      {title: "Ford Kuga 2.5 PHEV · 2023 · ST-Line X", make: "Ford", model: "Kuga 2.5 PHEV", year: 2023, mileageKm: 6200, fuel: "Hybrid", transmission: "Automatic", priceCzk: 780000, availability: "ON_SITE" as const},
      {title: "Peugeot 508 SW 2.0 BlueHDi · 2022 · GT", make: "Peugeot", model: "508 SW 2.0 BlueHDi", year: 2022, mileageKm: 39000, fuel: "Diesel", transmission: "Automatic", priceCzk: 570000, availability: "ON_SITE" as const},
      {title: "Opel Grandland X · 2021 · Ultimate", make: "Opel", model: "Grandland X", year: 2021, mileageKm: 68000, fuel: "Petrol", transmission: "Automatic", priceCzk: 430000, availability: "IN_TRANSIT" as const},
      {title: "Renault Captur E-TECH · 2023 · Techno", make: "Renault", model: "Captur E-TECH", year: 2023, mileageKm: 4100, fuel: "Hybrid", transmission: "Automatic", priceCzk: 540000, availability: "ON_SITE" as const},
    ],
    applicants: [
      {name: "Pavel Šimánek", phone: "+420 736 789 123", email: "pavel.simanek@gmail.com", city: "Plzeň", message: "Ford Kuga PHEV — zajímá mě státní příspěvek na elektro"},
      {name: "Jana Beneš", phone: "+420 608 456 789", email: "jana.benes@email.cz", city: "Plzeň", message: "Renault Captur — cena s leasingem na 48 měs?"},
    ],
  },
  {
    name: "Bohemia Cars Liberec",
    slug: "bohemiacars",
    ownerEmail: "crm@bohemiacars.demo",
    city: "Liberec",
    vehicles: [
      {title: "Mazda CX-5 2.0 Skyactiv-G · 2023 · Homura", make: "Mazda", model: "CX-5 2.0 Skyactiv-G", year: 2023, mileageKm: 9800, fuel: "Petrol", transmission: "Automatic", priceCzk: 680000, availability: "ON_SITE" as const},
      {title: "Honda CR-V 2.0 i-MMD · 2022 · Executive", make: "Honda", model: "CR-V 2.0 i-MMD", year: 2022, mileageKm: 28500, fuel: "Hybrid", transmission: "Automatic", priceCzk: 740000, availability: "ON_SITE" as const},
      {title: "Nissan Qashqai e-POWER · 2023 · Tekna", make: "Nissan", model: "Qashqai e-POWER", year: 2023, mileageKm: 5100, fuel: "Hybrid", transmission: "Automatic", priceCzk: 650000, availability: "IN_TRANSIT" as const},
    ],
    applicants: [
      {name: "Tomáš Kratochvíl", phone: "+420 724 963 258", email: "tomas.kratochvil@gmail.com", city: "Liberec", message: "Mazda CX-5 — možnost odpočtu DPH pro firmu?"},
      {name: "Eva Marková", phone: "+420 607 852 741", email: "eva.markova@seznam.cz", city: "Jablonec", message: "Honda CR-V hybridní — jaký je reálný spotřeba?"},
    ],
  },
  {
    name: "Central Auto Olomouc",
    slug: "centralauto",
    ownerEmail: "crm@centralauto.demo",
    city: "Olomouc",
    vehicles: [
      {title: "Volvo XC60 B4 · 2022 · Inscription", make: "Volvo", model: "XC60 B4", year: 2022, mileageKm: 22000, fuel: "Hybrid", transmission: "Automatic", priceCzk: 980000, availability: "ON_SITE" as const},
      {title: "Kia EV6 77.4 kWh · 2023 · GT-Line", make: "Kia", model: "EV6 77.4 kWh", year: 2023, mileageKm: 7300, fuel: "Electric", transmission: "Automatic", priceCzk: 1050000, availability: "ON_SITE" as const},
      {title: "Lexus RX 450h+ · 2023 · F Sport", make: "Lexus", model: "RX 450h+", year: 2023, mileageKm: 3400, fuel: "Hybrid", transmission: "Automatic", priceCzk: 1390000, availability: "IN_TRANSIT" as const},
      {title: "Subaru Outback 2.5i · 2022 · Lineartronic", make: "Subaru", model: "Outback 2.5i", year: 2022, mileageKm: 31000, fuel: "Petrol", transmission: "Automatic", priceCzk: 680000, availability: "ON_SITE" as const},
    ],
    applicants: [
      {name: "Radek Vašíček", phone: "+420 737 147 258", email: "radek.vasicek@gmail.com", city: "Olomouc", message: "Kia EV6 — dotace na elektrické auto a podmínky?"},
      {name: "Veronika Navrátilová", phone: "+420 602 369 147", email: "veronika.navratilova@volny.cz", city: "Přerov", message: "Volvo XC60 — preferuji leasing se zůstatkovou hodnotou"},
    ],
  },
];

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  YASKRAVA — Full Demo Seed");
  console.log("══════════════════════════════════════════════════\n");

  const results: Array<{
    name: string; slug: string; subdomain: string;
    ownerEmail: string; ownerPassword: string;
    vehicleCount: number; applicationCount: number;
    status: "created" | "skipped";
  }> = [];

  for (const d of DEALERS) {
    process.stdout.write(`\n▸ Processing dealer: ${d.name} (${d.slug})\n`);

    // 1. Check if dealer already exists
    const existingDealer = await prisma.dealer.findFirst({
      where: {slug: d.slug},
    });

    let dealer = existingDealer;
    let password = "";
    let dealerStatus: "created" | "skipped" = "skipped";

    if (!existingDealer) {
      // 2. Create dealer
      dealer = await prisma.dealer.create({
        data: {
          name: d.name,
          slug: d.slug,
          status: "ACTIVE",
        },
      });
      console.log(`  ✓ Dealer created: id=${dealer.id}`);
      dealerStatus = "created";

      // 3. Create or find owner user
      password = genPassword();
      const hashedPwd = await hashPwd(password);

      const existingUser = await prisma.adminUser.findFirst({
        where: {email: d.ownerEmail},
      });

      let owner = existingUser;
      if (!owner) {
        owner = await prisma.adminUser.create({
          data: {
            email: d.ownerEmail,
            passwordHash: hashedPwd,
            firstName: d.name,
            lastName: "Owner",
            isActive: true,
          },
        });
        console.log(`  ✓ Owner user created: ${d.ownerEmail}`);
      } else {
        // Update password for existing user
        await prisma.adminUser.update({
          where: {id: owner.id},
          data: {passwordHash: hashedPwd, isActive: true},
        });
        console.log(`  ~ Owner user updated: ${d.ownerEmail}`);
      }

      // 4. Create membership
      const existingMembership = await prisma.dealerMembership.findFirst({
        where: {dealerId: dealer.id, userId: owner.id},
      });
      if (!existingMembership) {
        await prisma.dealerMembership.create({
          data: {
            dealerId: dealer.id,
            userId: owner.id,
            role: "DEALER_OWNER",
            isActive: true,
          },
        });
        console.log(`  ✓ Membership created`);
      }

      // 5. Register subdomain in DealerDomain
      const hostname = `${d.slug}.yaskrava.eu`;
      const existingDomain = await prisma.dealerDomain.findFirst({where: {hostname}});
      if (!existingDomain) {
        await prisma.dealerDomain.create({
          data: {dealerId: dealer.id, hostname, isPrimary: true},
        });
        console.log(`  ✓ Domain registered: ${hostname}`);
      }

      // 6. Audit log
      await prisma.auditLog.create({
        data: {
          action: "DEALER_PROVISIONED",
          actorType: "SYSTEM",
          dealerId: dealer.id,
          targetId: dealer.id,
          message: `Demo seed provisioned dealer ${d.name}.`,
          metadata: {} as never,
        },
      });
    } else {
      console.log(`  ~ Dealer already exists, adding data...`);
      password = "(existing — check CRM)";
      // Ensure domain exists for existing dealers too
      const hostname = `${d.slug}.yaskrava.eu`;
      const existingDomain = await prisma.dealerDomain.findFirst({where: {hostname}});
      if (!existingDomain) {
        await prisma.dealerDomain.create({
          data: {dealerId: dealer.id, hostname, isPrimary: true},
        });
        console.log(`  ✓ Domain registered: ${hostname}`);
      }
    }

    if (!dealer) continue;

    // 6. Add vehicles (skip existing ones by title)
    let vehiclesAdded = 0;
    const existingVehicles = await prisma.vehicle.findMany({
      where: {dealerId: dealer.id, deletedAt: null},
      select: {title: true},
    });
    const existingTitles = new Set(existingVehicles.map((v) => v.title));

    for (const v of d.vehicles) {
      if (existingTitles.has(v.title)) {
        console.log(`  ~ Vehicle exists: ${v.title}`);
        continue;
      }
      const slugBase = slugify(v.title);
      const slug = slugBase + "-" + randomBytes(2).toString("hex");
      await prisma.vehicle.create({
        data: {
          dealerId: dealer.id,
          slug,
          title: v.title,
          make: v.make,
          model: v.model,
          year: v.year,
          mileageKm: v.mileageKm,
          fuel: v.fuel,
          transmission: v.transmission,
          priceCzk: v.priceCzk,
          availability: v.availability,
          published: true,
          leasingEligible: true,
        },
      });
      vehiclesAdded++;
      console.log(`  ✓ Vehicle added: ${v.title}`);
    }

    // 7. Submit financing applications via public API
    let appsSubmitted = 0;
    const calcSnapshot = {
      vehiclePriceCzk: 700000,
      downPaymentCzk: 140000,
      termMonths: 48,
      monthlyTotalCzk: 13500,
      residualCzk: 70000,
      interestRate: 0.059,
      totalCostCzk: 718000,
    };

    for (const applicant of d.applicants) {
      try {
        const res = await fetch(`${API_BASE}/api/applications`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-host": `${d.slug}.yaskrava.eu`,
            "host": `${d.slug}.yaskrava.eu`,
          },
          body: JSON.stringify({
            locale: "cs",
            sourcePath: `/fleet`,
            topic: "LEASING",
            fullName: applicant.name,
            phone: applicant.phone,
            email: applicant.email,
            city: applicant.city,
            message: applicant.message,
            consent: true,
            calculator: calcSnapshot,
          }),
        });
        const json = await res.json() as {id?: string; error?: string};
        if (json.id) {
          appsSubmitted++;
          console.log(`  ✓ Application submitted: ${applicant.name} → ID ${json.id}`);
        } else {
          console.log(`  ✗ Application failed: ${applicant.name} — ${json.error || res.status}`);
        }
      } catch (err) {
        console.log(`  ✗ Application error: ${applicant.name} — ${err}`);
      }
    }

    results.push({
      name: d.name,
      slug: d.slug,
      subdomain: `${d.slug}.yaskrava.eu`,
      ownerEmail: d.ownerEmail,
      ownerPassword: password,
      vehicleCount: vehiclesAdded,
      applicationCount: appsSubmitted,
      status: dealerStatus,
    });
  }

  // ─── summary ──────────────────────────────────────────────────────────────

  console.log("\n\n══════════════════════════════════════════════════");
  console.log("  SEED COMPLETE — SUMMARY");
  console.log("══════════════════════════════════════════════════");

  for (const r of results) {
    const icon = r.status === "created" ? "🆕" : "♻️";
    console.log(`\n${icon} ${r.name} [${r.status.toUpperCase()}]`);
    console.log(`   Сайт:      https://${r.subdomain}/en/fleet`);
    console.log(`   CRM:       https://${r.subdomain}/dealer`);
    console.log(`   Email:     ${r.ownerEmail}`);
    console.log(`   Пароль:    ${r.ownerPassword}`);
    console.log(`   Авто:      +${r.vehicleCount} нових`);
    console.log(`   Заявки:    +${r.applicationCount} нових`);
  }

  // DB totals
  const [totalDealers, totalVehicles, totalApplications] = await Promise.all([
    prisma.dealer.count({where: {status: "ACTIVE", deletedAt: null}}),
    prisma.vehicle.count({where: {deletedAt: null, published: true}}),
    prisma.application.count({where: {deletedAt: null}}),
  ]);

  console.log("\n──────────────────────────────────────────────────");
  console.log(`  БД totals:`);
  console.log(`   Дилерів активних:  ${totalDealers}`);
  console.log(`   Авто опублікованих: ${totalVehicles}`);
  console.log(`   Заявок всього:      ${totalApplications}`);
  console.log("══════════════════════════════════════════════════\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("SEED ERROR:", err);
    prisma.$disconnect();
    process.exit(1);
  });
