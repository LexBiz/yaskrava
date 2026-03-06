"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {z} from "zod";
import {hash} from "bcryptjs";

import {clearAdminCookie, requireAdmin, setAdminCookie} from "@/lib/adminAuth";
import {authenticateWithPassword} from "@/lib/auth";
import {writeAuditLog} from "@/lib/audit";
import {prisma} from "@/lib/prisma";
import {assertRateLimit} from "@/lib/rateLimit";
import {assertSameOrigin, getClientIp} from "@/lib/security";
import {slugify, uniqueSlug} from "@/lib/slug";
import {buildDealerHostname} from "@/lib/tenant";

export async function adminLoginAction(formData: FormData) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    redirect("/admin/login?error=validation");
  }

  const ip = await getClientIp();
  try {
    assertRateLimit({
      key: `admin-login:${ip}`,
      limit: 10,
      windowMs: 1000 * 60 * 15,
    });
  } catch {
    redirect("/admin/login?error=rate");
  }

  const user = await authenticateWithPassword(parsed.data.email, parsed.data.password);
  if (!user?.platformRole) {
    redirect("/admin/login?error=credentials");
  }

  await setAdminCookie(user.id);
  await writeAuditLog({
    action: "USER_LOGIN",
    actorUserId: user.id,
    message: "Central CRM login",
  });
  redirect("/admin");
}

export async function adminLogoutAction() {
  const user = await requireAdmin();
  await clearAdminCookie();
  await writeAuditLog({
    action: "USER_LOGOUT",
    actorUserId: user.id,
    message: "Central CRM logout",
  });
  redirect("/admin/login");
}

export async function setApplicationStatusAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    status: z.enum(["NEW", "IN_REVIEW", "NEED_INFO", "CONTACTED", "APPROVED", "REJECTED"]),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });

  await prisma.application.update({
    where: {id: parsed.id},
    data: {
      status: parsed.status,
      contactedAt: parsed.status === "CONTACTED" ? new Date() : undefined,
      decisionAt:
        parsed.status === "APPROVED" || parsed.status === "REJECTED"
          ? new Date()
          : undefined,
    },
  });

  await writeAuditLog({
    action: "APPLICATION_STATUS_UPDATED",
    actorUserId: user.id,
    applicationId: parsed.id,
    message: `Central CRM updated application status to ${parsed.status}.`,
  });

  revalidatePath("/admin");
}

export async function toggleArchivedAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    archived: z.string().optional(),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
    archived: formData.get("archived") ? "on" : undefined,
  });

  await prisma.application.update({
    where: {id: parsed.id},
    data: {archived: Boolean(parsed.archived)},
  });

  await writeAuditLog({
    action: "APPLICATION_ARCHIVED",
    actorUserId: user.id,
    applicationId: parsed.id,
    message: `Central CRM changed archived=${Boolean(parsed.archived)}.`,
  });

  revalidatePath("/admin");
}

export async function deleteApplicationAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
  });

  await prisma.application.update({
    where: {id: parsed.id},
    data: {
      deletedAt: new Date(),
      archived: true,
    },
  });

  await writeAuditLog({
    action: "APPLICATION_SOFT_DELETED",
    actorUserId: user.id,
    applicationId: parsed.id,
    message: "Central CRM soft-deleted an application.",
  });

  revalidatePath("/admin");
}

export async function setAdminNoteAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    adminNote: z.string().max(5000).optional(),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
    adminNote: String(formData.get("adminNote") ?? "").trim() || undefined,
  });

  await prisma.application.update({
    where: {id: parsed.id},
    data: {adminNote: parsed.adminNote},
  });

  await writeAuditLog({
    action: "APPLICATION_NOTE_UPDATED",
    actorUserId: user.id,
    applicationId: parsed.id,
    message: "Central CRM updated application note.",
  });

  revalidatePath("/admin");
}

export async function setFinancingStatusAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    status: z.enum([
      "NEW",
      "QUALIFYING",
      "DOCUMENTS_PENDING",
      "SUBMITTED",
      "APPROVED",
      "REJECTED",
      "FUNDED",
    ]),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: {id: parsed.id},
      data: {
        financingStatus: parsed.status,
        decisionAt:
          parsed.status === "APPROVED" ||
          parsed.status === "REJECTED" ||
          parsed.status === "FUNDED"
            ? new Date()
            : undefined,
      },
    });

    await tx.financingCase.upsert({
      where: {applicationId: parsed.id},
      update: {
        status: parsed.status,
        assignedYaskravaUserId: user.id,
      },
      create: {
        applicationId: parsed.id,
        status: parsed.status,
        assignedYaskravaUserId: user.id,
      },
    });
  });

  await writeAuditLog({
    action: "FINANCING_STATUS_UPDATED",
    actorUserId: user.id,
    applicationId: parsed.id,
    message: `Central CRM updated financing status to ${parsed.status}.`,
  });

  revalidatePath("/admin");
}

export async function createDealerProvisionAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    name: z.string().min(2).max(120),
    slug: z.string().min(2).max(60).optional(),
    legalName: z.string().max(160).optional(),
    supportEmail: z.string().email().max(200),
    supportPhone: z.string().max(40).optional(),
    ownerEmail: z.string().email().max(200),
    ownerFirstName: z.string().max(80).optional(),
    ownerLastName: z.string().max(80).optional(),
    ownerPassword: z.string().min(8).max(120),
  });

  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    legalName: String(formData.get("legalName") ?? "").trim() || undefined,
    supportEmail: String(formData.get("supportEmail") ?? "").trim().toLowerCase(),
    supportPhone: String(formData.get("supportPhone") ?? "").trim() || undefined,
    ownerEmail: String(formData.get("ownerEmail") ?? "").trim().toLowerCase(),
    ownerFirstName: String(formData.get("ownerFirstName") ?? "").trim() || undefined,
    ownerLastName: String(formData.get("ownerLastName") ?? "").trim() || undefined,
    ownerPassword: String(formData.get("ownerPassword") ?? ""),
  });

  if (!parsed.success) {
    redirect("/admin?dealerError=validation");
  }

  const slugBase = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const finalSlug = slugBase || uniqueSlug(parsed.data.name);
  const hostname = buildDealerHostname(finalSlug);
  const passwordHash = await hash(parsed.data.ownerPassword, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const dealer = await tx.dealer.create({
        data: {
          slug: finalSlug,
          name: parsed.data.name,
          legalName: parsed.data.legalName,
          supportEmail: parsed.data.supportEmail,
          supportPhone: parsed.data.supportPhone,
          websiteTitle: parsed.data.name,
        },
      });

      await tx.dealerDomain.create({
        data: {
          dealerId: dealer.id,
          hostname,
          isPrimary: true,
        },
      });

      const owner = await tx.adminUser.upsert({
        where: {email: parsed.data.ownerEmail},
        update: {
          passwordHash,
          firstName: parsed.data.ownerFirstName,
          lastName: parsed.data.ownerLastName,
          isActive: true,
        },
        create: {
          email: parsed.data.ownerEmail,
          passwordHash,
          firstName: parsed.data.ownerFirstName,
          lastName: parsed.data.ownerLastName,
          isActive: true,
        },
      });

      await tx.dealerMembership.upsert({
        where: {
          userId_dealerId: {
            dealerId: dealer.id,
            userId: owner.id,
          },
        },
        update: {
          role: "DEALER_OWNER",
          isActive: true,
        },
        create: {
          dealerId: dealer.id,
          userId: owner.id,
          role: "DEALER_OWNER",
        },
      });

      await tx.auditLog.create({
        data: {
          action: "DEALER_PROVISIONED",
          actorType: "SYSTEM",
          actorUserId: user.id,
          dealerId: dealer.id,
          targetId: dealer.id,
          message: `Dealer ${parsed.data.name} provisioned in central CRM.`,
          metadata: {
            hostname,
            ownerEmail: parsed.data.ownerEmail,
          } as never,
        },
      });
    });
  } catch {
    redirect("/admin?dealerError=duplicate");
  }

  redirect(`/admin?dealerCreated=${finalSlug}`);
}

