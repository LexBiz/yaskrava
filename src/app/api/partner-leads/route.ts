import {NextResponse} from "next/server";

import {partnerLeadCreateSchema} from "@/lib/applicationSchema";
import {prisma} from "@/lib/prisma";
import {assertRateLimit} from "@/lib/rateLimit";
import {getClientIp} from "@/lib/security";
import {getRequestHostname} from "@/lib/tenant";
import {writeAuditLog} from "@/lib/audit";

export async function POST(request: Request) {
  const requestHostname = await getRequestHostname();
  const ip = await getClientIp();

  try {
    assertRateLimit({
      key: `partner:${requestHostname}:${ip}`,
      limit: 10,
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

  const parsed = partnerLeadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {error: "Validation failed", details: parsed.error.flatten()},
      {status: 400}
    );
  }

  const lead = await prisma.partnerLead.create({
    data: {
      sourceDomain: requestHostname || "unknown",
      sourcePath: parsed.data.sourcePath,
      utmSource: parsed.data.utmSource,
      utmMedium: parsed.data.utmMedium,
      utmCampaign: parsed.data.utmCampaign,
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      city: parsed.data.city,
      fleetSize: parsed.data.fleetSize,
      message: parsed.data.message,
    },
  });

  await writeAuditLog({
    action: "PARTNER_LEAD_CREATED",
    actorType: "SYSTEM",
    partnerLeadId: lead.id,
    message: "Partner lead created from public partner form.",
    metadata: {
      ip,
      sourceDomain: requestHostname,
    },
  });

  return NextResponse.json({id: lead.id});
}
