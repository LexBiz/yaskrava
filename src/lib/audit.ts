"use server";

import "server-only";

import type {AuditAction, AuditActorType} from "@/generated/prisma/enums";
import {prisma} from "@/lib/prisma";

export async function writeAuditLog(input: {
  action: AuditAction;
  actorType?: AuditActorType;
  actorUserId?: string | null;
  dealerId?: string | null;
  applicationId?: string | null;
  partnerLeadId?: string | null;
  vehicleId?: string | null;
  targetId?: string | null;
  message?: string | null;
  metadata?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      actorType: input.actorType ?? "USER",
      actorUserId: input.actorUserId ?? undefined,
      dealerId: input.dealerId ?? undefined,
      applicationId: input.applicationId ?? undefined,
      partnerLeadId: input.partnerLeadId ?? undefined,
      vehicleId: input.vehicleId ?? undefined,
      targetId: input.targetId ?? undefined,
      message: input.message ?? undefined,
      metadata: input.metadata as never,
    },
  });
}
