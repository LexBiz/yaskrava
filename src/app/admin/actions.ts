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
import {saveVehicleImage} from "@/lib/uploads";

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

export async function setPartnerLeadStatusAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    status: z.enum(["NEW", "IN_REVIEW", "CONTACTED", "APPROVED", "REJECTED"]),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });

  await prisma.partnerLead.update({
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
    action: "PARTNER_LEAD_STATUS_UPDATED",
    actorUserId: user.id,
    partnerLeadId: parsed.id,
    message: `Central CRM updated partner lead status to ${parsed.status}.`,
  });

  revalidatePath("/admin");
}

export async function togglePartnerLeadArchivedAction(formData: FormData) {
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

  await prisma.partnerLead.update({
    where: {id: parsed.id},
    data: {
      archived: Boolean(parsed.archived),
    },
  });

  await writeAuditLog({
    action: "PARTNER_LEAD_ARCHIVED",
    actorUserId: user.id,
    partnerLeadId: parsed.id,
    message: `Central CRM changed partner archived=${Boolean(parsed.archived)}.`,
  });

  revalidatePath("/admin");
}

export async function setPartnerLeadNoteAction(formData: FormData) {
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

  await prisma.partnerLead.update({
    where: {id: parsed.id},
    data: {
      adminNote: parsed.adminNote,
    },
  });

  await writeAuditLog({
    action: "PARTNER_LEAD_NOTE_UPDATED",
    actorUserId: user.id,
    partnerLeadId: parsed.id,
    message: "Central CRM updated partner lead note.",
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

export async function createPlatformVehicleAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    dealerId: z.string().min(1),
    title: z.string().min(3).max(160),
    stockNumber: z.string().max(80).optional(),
    make: z.string().max(80).optional(),
    model: z.string().max(80).optional(),
    year: z.coerce.number().int().min(1950).max(2100).optional(),
    mileageKm: z.coerce.number().int().min(0).max(2_000_000).optional(),
    fuel: z.string().max(40).optional(),
    transmission: z.string().max(40).optional(),
    vinLast6: z.string().max(20).optional(),
    priceCzk: z.coerce.number().int().min(0).max(100_000_000).optional(),
    imageUrl: z.string().url().max(2000).optional(),
    description: z.string().max(5000).optional(),
    leasingEligible: z.string().optional(),
    availability: z.enum(["IN_TRANSIT", "ON_SITE", "SOLD"]).default("ON_SITE"),
  });

  const parsed = schema.parse({
    dealerId: String(formData.get("dealerId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    stockNumber: String(formData.get("stockNumber") ?? "").trim() || undefined,
    make: String(formData.get("make") ?? "").trim() || undefined,
    model: String(formData.get("model") ?? "").trim() || undefined,
    year: String(formData.get("year") ?? "").trim() || undefined,
    mileageKm: String(formData.get("mileageKm") ?? "").trim() || undefined,
    fuel: String(formData.get("fuel") ?? "").trim() || undefined,
    transmission: String(formData.get("transmission") ?? "").trim() || undefined,
    vinLast6: String(formData.get("vinLast6") ?? "").trim() || undefined,
    priceCzk: String(formData.get("priceCzk") ?? "").trim() || undefined,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    leasingEligible: formData.get("leasingEligible") ? "on" : undefined,
    availability: String(formData.get("availability") ?? "ON_SITE"),
  });

  const uploadedImageUrl = await saveVehicleImage(formData.get("imageFile") as File | null);
  let slug = slugify(parsed.title);
  if (!slug) slug = uniqueSlug("vehicle");

  const existing = await prisma.vehicle.findFirst({
    where: {dealerId: parsed.dealerId, slug},
    select: {id: true},
  });

  if (existing) slug = uniqueSlug(slug);

  const vehicle = await prisma.vehicle.create({
    data: {
      dealerId: parsed.dealerId,
      slug,
      title: parsed.title,
      stockNumber: parsed.stockNumber,
      make: parsed.make,
      model: parsed.model,
      year: parsed.year,
      mileageKm: parsed.mileageKm,
      fuel: parsed.fuel,
      transmission: parsed.transmission,
      vinLast6: parsed.vinLast6,
      priceCzk: parsed.priceCzk,
      imageUrl: uploadedImageUrl || parsed.imageUrl,
      description: parsed.description,
      leasingEligible: Boolean(parsed.leasingEligible),
      availability: parsed.availability,
      published: true,
    },
  });

  await writeAuditLog({
    action: "VEHICLE_CREATED",
    actorUserId: user.id,
    dealerId: parsed.dealerId,
    vehicleId: vehicle.id,
    message: `Central CRM created vehicle ${vehicle.title}.`,
  });

  revalidatePath("/admin");
}

