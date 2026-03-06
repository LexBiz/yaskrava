import {NextResponse} from "next/server";

import {prisma} from "@/lib/prisma";
import {applicationCreateSchema} from "@/lib/applicationSchema";
import {Prisma} from "@/generated/prisma/client";
import {writeAuditLog} from "@/lib/audit";
import {assertRateLimit} from "@/lib/rateLimit";
import {getClientIp} from "@/lib/security";
import {getCurrentDealer, getRequestHostname} from "@/lib/tenant";

export async function POST(request: Request) {
  const dealer = await getCurrentDealer();
  if (!dealer) {
    return NextResponse.json({error: "Unknown dealer host"}, {status: 400});
  }
  const requestHostname = await getRequestHostname();

  const ip = await getClientIp();
  try {
    assertRateLimit({
      key: `lead:${dealer.id}:${ip}`,
      limit: 15,
      windowMs: 1000 * 60 * 15,
    });
  } catch {
    return NextResponse.json({error: "Too many requests"}, {status: 429});
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: "Invalid JSON"}, {status: 400});
  }

  const parsed = applicationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {error: "Validation failed", details: parsed.error.flatten()},
      {status: 400}
    );
  }

  const data = parsed.data;

  let vehicleId = data.vehicleId;
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        dealerId: dealer.id,
        deletedAt: null,
      },
      select: {id: true},
    });

    if (!vehicle) {
      vehicleId = undefined;
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const application = await tx.application.create({
      data: {
        dealerId: dealer.id,
        vehicleId,
        locale: data.locale,
        sourceDomain: requestHostname || dealer.domains[0]?.hostname || "unknown",
        sourcePath: data.sourcePath,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        city: data.city,
        message: data.message,
        consent: true,
        calculator: data.calculator
          ? (data.calculator as unknown as Prisma.InputJsonValue)
          : undefined,
        topic: data.topic,
      },
    });

    await tx.financingCase.create({
      data: {
        applicationId: application.id,
        status: "NEW",
      },
    });

    return application;
  });

  await writeAuditLog({
    action: "APPLICATION_CREATED",
    actorType: "SYSTEM",
    dealerId: dealer.id,
    applicationId: created.id,
    message: "Application created from public form.",
    metadata: {
      ip,
      topic: created.topic,
      locale: created.locale,
      sourcePath: created.sourcePath,
    },
  });

  return NextResponse.json({id: created.id});
}

