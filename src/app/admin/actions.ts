"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {z} from "zod";
import {hash} from "bcryptjs";
import {Prisma} from "@/generated/prisma/client";

import {clearAdminCookie, requireAdmin, setAdminCookie} from "@/lib/adminAuth";
import {authenticateWithPassword} from "@/lib/auth";
import {writeAuditLog} from "@/lib/audit";
import {prisma} from "@/lib/prisma";
import {assertRateLimit} from "@/lib/rateLimit";
import {assertSameOrigin, getClientIp} from "@/lib/security";
import {slugify, uniqueSlug} from "@/lib/slug";
import {buildDealerHostname} from "@/lib/tenant";
import {saveVehicleImages, saveVehicleVideos} from "@/lib/uploads";
import {
  asFiles,
  getPrimaryAndSecondaryMedia,
  parseTextareaLines,
  validateMediaUrls,
} from "@/lib/vehicleMedia";

function getPlatformDealerSlug() {
  return process.env.DEFAULT_DEALER_SLUG || "yaskrava";
}

async function getPlatformDealerOrThrow() {
  const dealer = await prisma.dealer.findUnique({
    where: {slug: getPlatformDealerSlug()},
    select: {id: true, slug: true},
  });
  if (!dealer) {
    throw new Error("PLATFORM_DEALER_NOT_FOUND");
  }
  return dealer;
}

async function revalidateCareerPages() {
  revalidatePath("/en/career");
  revalidatePath("/cs/career");
  revalidatePath("/uk/career");
}

function revalidateFleetPages() {
  revalidatePath("/en/fleet");
  revalidatePath("/cs/fleet");
  revalidatePath("/uk/fleet");
}

const VALID_FINANCING_PERIODS = ["today", "7d", "30d", "all"] as const;
const VALID_FINANCING_SORTS = ["newest", "oldest", "dealer", "status"] as const;

function buildFinancingReturnUrl(formData: FormData, forceShowArchived?: boolean): string {
  const rawPeriod = String(formData.get("_period") ?? "");
  const rawSort = String(formData.get("_sort") ?? "");
  const rawArchived = formData.get("_archived") === "1";

  const period = (VALID_FINANCING_PERIODS as readonly string[]).includes(rawPeriod) ? rawPeriod : "all";
  const sort = (VALID_FINANCING_SORTS as readonly string[]).includes(rawSort) ? rawSort : "newest";
  const showArchived = forceShowArchived !== undefined ? forceShowArchived : rawArchived;

  const params = new URLSearchParams({view: "financing", period, sort});
  if (showArchived) params.set("archived", "1");
  return `/admin?${params.toString()}`;
}

function redirectVehicleState(state: "created" | "updated" | "validation" | "platform") {
  const query = new URLSearchParams({
    view: "vehicles",
  });

  if (state === "created" || state === "updated") {
    query.set("vehicleSaved", state);
  } else {
    query.set("vehicleError", state);
  }

  redirect(`/admin?${query.toString()}`);
}

function redirectVacancyState(state: "created" | "updated" | "validation") {
  const query = new URLSearchParams({
    view: "vacancies",
  });

  if (state === "created" || state === "updated") {
    query.set("vacancySaved", state);
  } else {
    query.set("vacancyError", state);
  }

  redirect(`/admin?${query.toString()}`);
}

const vehicleFormSchema = z.object({
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
  imageUrl: z.string().max(2000).optional(),
  galleryImageUrls: z.string().max(10000).optional(),
  videoUrl: z.string().max(2000).optional(),
  galleryVideoUrls: z.string().max(10000).optional(),
  description: z.string().max(5000).optional(),
  leasingEligible: z.string().optional(),
  availability: z.enum(["IN_TRANSIT", "ON_SITE", "SOLD"]).default("ON_SITE"),
  published: z.string().optional(),
  featured: z.string().optional(),
});

function getVehicleFormInput(formData: FormData) {
  const parsed = vehicleFormSchema.safeParse({
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
    galleryImageUrls: String(formData.get("galleryImageUrls") ?? "").trim() || undefined,
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || undefined,
    galleryVideoUrls: String(formData.get("galleryVideoUrls") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    leasingEligible: formData.get("leasingEligible") ? "on" : undefined,
    availability: String(formData.get("availability") ?? "ON_SITE"),
    published: formData.get("published") ? "on" : undefined,
    featured: formData.get("featured") ? "on" : undefined,
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

const MAX_VEHICLE_IMAGES = 30;

async function collectVehicleMedia(formData: FormData, input: z.infer<typeof vehicleFormSchema>) {
  const uploadedImages = await saveVehicleImages(
    asFiles(
      [...formData.getAll("imageFiles"), formData.get("imageFile")].filter(
        (entry): entry is FormDataEntryValue => entry !== null
      )
    ).slice(0, MAX_VEHICLE_IMAGES)
  );

  // Only 1 video allowed: prefer uploaded file, fall back to URL
  const uploadedVideoFile = asFiles(
    [...formData.getAll("videoFiles"), formData.get("videoFile")].filter(
      (entry): entry is FormDataEntryValue => entry !== null
    )
  ).slice(0, 1);
  const uploadedVideos = await saveVehicleVideos(uploadedVideoFile);

  const manualImageUrls = [input.imageUrl, ...parseTextareaLines(formData.get("galleryImageUrls"))].filter(
    Boolean
  ) as string[];

  if (!validateMediaUrls(manualImageUrls)) {
    return null;
  }
  if (input.videoUrl && !validateMediaUrls([input.videoUrl])) {
    return null;
  }

  // Cap total images at MAX_VEHICLE_IMAGES
  const allImages = [...manualImageUrls, ...uploadedImages].slice(0, MAX_VEHICLE_IMAGES);
  const imageMedia = getPrimaryAndSecondaryMedia(allImages);

  // Only 1 video total
  const primaryVideo = uploadedVideos[0] || input.videoUrl;
  const galleryVideos = primaryVideo ? [primaryVideo] : [];

  return {
    primaryImage: imageMedia.primary,
    galleryImages: imageMedia.all,
    primaryVideo,
    galleryVideos,
  };
}

export async function adminLoginAction(formData: FormData) {
  await assertSameOrigin();
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

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!parsed.success) return;

  await prisma.application.updateMany({
    where: {id: parsed.data.id, deletedAt: null},
    data: {
      status: parsed.data.status,
      contactedAt: parsed.data.status === "CONTACTED" ? new Date() : undefined,
      decisionAt:
        parsed.data.status === "APPROVED" || parsed.data.status === "REJECTED"
          ? new Date()
          : undefined,
    },
  });

  await writeAuditLog({
    action: "APPLICATION_STATUS_UPDATED",
    actorUserId: user.id,
    applicationId: parsed.data.id,
    message: `Central CRM updated application status to ${parsed.data.status}.`,
  });

  const returnUrl = buildFinancingReturnUrl(formData);
  revalidatePath("/admin");
  redirect(returnUrl);
}

export async function toggleArchivedAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    archived: z.string().optional(),
  });

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    archived: formData.get("archived") ? "on" : undefined,
  });
  if (!parsed.success) return;

  await prisma.application.updateMany({
    where: {id: parsed.data.id, deletedAt: null},
    data: {archived: Boolean(parsed.data.archived)},
  });

  await writeAuditLog({
    action: "APPLICATION_ARCHIVED",
    actorUserId: user.id,
    applicationId: parsed.data.id,
    message: `Central CRM changed archived=${Boolean(parsed.data.archived)}.`,
  });

  const isArchiving = Boolean(parsed.data.archived);
  // After archiving → return to regular view (item disappears); after unarchiving → stay in archive view
  const returnUrl = buildFinancingReturnUrl(formData, isArchiving ? false : true);
  revalidatePath("/admin");
  redirect(returnUrl);
}

export async function deleteApplicationAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({id: z.string().min(1)});
  const parsed = schema.safeParse({id: String(formData.get("id") ?? "")});
  if (!parsed.success) return;

  await prisma.application.updateMany({
    where: {id: parsed.data.id, deletedAt: null},
    data: {deletedAt: new Date(), archived: true},
  });

  await writeAuditLog({
    action: "APPLICATION_SOFT_DELETED",
    actorUserId: user.id,
    applicationId: parsed.data.id,
    message: "Central CRM soft-deleted an application.",
  });

  revalidatePath("/admin");
  redirect(buildFinancingReturnUrl(formData, false));
}

export async function setAdminNoteAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    adminNote: z.string().max(5000).optional(),
  });

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    adminNote: String(formData.get("adminNote") ?? "").trim() || undefined,
  });
  if (!parsed.success) return;

  await prisma.application.updateMany({
    where: {id: parsed.data.id, deletedAt: null},
    data: {adminNote: parsed.data.adminNote},
  });

  await writeAuditLog({
    action: "APPLICATION_NOTE_UPDATED",
    actorUserId: user.id,
    applicationId: parsed.data.id,
    message: "Central CRM updated application note.",
  });

  const returnUrl = buildFinancingReturnUrl(formData);
  revalidatePath("/admin");
  redirect(returnUrl);
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

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!parsed.success) return;

  await prisma.$transaction(async (tx) => {
    await tx.application.updateMany({
      where: {id: parsed.data.id, deletedAt: null},
      data: {
        financingStatus: parsed.data.status,
        decisionAt:
          parsed.data.status === "APPROVED" ||
          parsed.data.status === "REJECTED" ||
          parsed.data.status === "FUNDED"
            ? new Date()
            : undefined,
      },
    });

    await tx.financingCase.upsert({
      where: {applicationId: parsed.data.id},
      update: {
        status: parsed.data.status,
        assignedYaskravaUserId: user.id,
      },
      create: {
        applicationId: parsed.data.id,
        status: parsed.data.status,
        assignedYaskravaUserId: user.id,
      },
    });
  });

  await writeAuditLog({
    action: "FINANCING_STATUS_UPDATED",
    actorUserId: user.id,
    applicationId: parsed.data.id,
    message: `Central CRM updated financing status to ${parsed.data.status}.`,
  });

  const returnUrl = buildFinancingReturnUrl(formData);
  revalidatePath("/admin");
  redirect(returnUrl);
}

export async function setPartnerLeadStatusAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    status: z.enum(["NEW", "IN_REVIEW", "CONTACTED", "APPROVED", "REJECTED"]),
  });

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!parsed.success) return;

  await prisma.partnerLead.updateMany({
    where: {id: parsed.data.id, deletedAt: null},
    data: {
      status: parsed.data.status,
      contactedAt: parsed.data.status === "CONTACTED" ? new Date() : undefined,
      decisionAt:
        parsed.data.status === "APPROVED" || parsed.data.status === "REJECTED"
          ? new Date()
          : undefined,
    },
  });

  await writeAuditLog({
    action: "PARTNER_LEAD_STATUS_UPDATED",
    actorUserId: user.id,
    partnerLeadId: parsed.data.id,
    message: `Central CRM updated partner lead status to ${parsed.data.status}.`,
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

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    archived: formData.get("archived") ? "on" : undefined,
  });
  if (!parsed.success) return;

  await prisma.partnerLead.updateMany({
    where: {id: parsed.data.id, deletedAt: null},
    data: {archived: Boolean(parsed.data.archived)},
  });

  await writeAuditLog({
    action: "PARTNER_LEAD_ARCHIVED",
    actorUserId: user.id,
    partnerLeadId: parsed.data.id,
    message: `Central CRM changed partner archived=${Boolean(parsed.data.archived)}.`,
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

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    adminNote: String(formData.get("adminNote") ?? "").trim() || undefined,
  });
  if (!parsed.success) return;

  await prisma.partnerLead.updateMany({
    where: {id: parsed.data.id, deletedAt: null},
    data: {adminNote: parsed.data.adminNote},
  });

  await writeAuditLog({
    action: "PARTNER_LEAD_NOTE_UPDATED",
    actorUserId: user.id,
    partnerLeadId: parsed.data.id,
    message: "Central CRM updated partner lead note.",
  });

  revalidatePath("/admin");
}

export async function createDealerProvisionAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    partnerLeadId: z.string().min(1).optional(),
    name: z.string().min(2).max(120),
    slug: z.string().min(2).max(60).optional(),
    legalName: z.string().max(160).optional(),
    supportEmail: z.string().email().max(200),
    supportPhone: z.string().max(40).optional(),
    ownerEmail: z.string().email().max(200),
    ownerFirstName: z.string().max(80).optional(),
    ownerLastName: z.string().max(80).optional(),
    ownerPassword: z.string().max(120).optional(),
  });

  const parsed = schema.safeParse({
    partnerLeadId: String(formData.get("partnerLeadId") ?? "").trim() || undefined,
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    legalName: String(formData.get("legalName") ?? "").trim() || undefined,
    supportEmail: String(formData.get("supportEmail") ?? "").trim().toLowerCase(),
    supportPhone: String(formData.get("supportPhone") ?? "").trim() || undefined,
    ownerEmail: String(formData.get("ownerEmail") ?? "").trim().toLowerCase(),
    ownerFirstName: String(formData.get("ownerFirstName") ?? "").trim() || undefined,
    ownerLastName: String(formData.get("ownerLastName") ?? "").trim() || undefined,
    ownerPassword: String(formData.get("ownerPassword") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    redirect("/admin?view=dealers&dealerError=validation");
  }

  // Auto-generate a secure password if not provided
  const {randomBytes} = await import("node:crypto");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let finalPassword = parsed.data.ownerPassword || "";
  if (!finalPassword || finalPassword.length < 8) {
    const buf = randomBytes(18);
    finalPassword = "";
    for (const byte of buf) {
      finalPassword += chars[byte % chars.length];
      if (finalPassword.length === 14) break;
    }
  }

  const slugBase = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const finalSlug = slugBase || uniqueSlug(parsed.data.name);
  const hostname = buildDealerHostname(finalSlug);
  const passwordHash = await hash(finalPassword, 12);

  const [existingDealer, existingDomain, existingOwner] = await Promise.all([
    prisma.dealer.findUnique({
      where: {slug: finalSlug},
      select: {id: true, name: true},
    }),
    prisma.dealerDomain.findUnique({
      where: {hostname},
      select: {id: true},
    }),
    prisma.adminUser.findUnique({
      where: {email: parsed.data.ownerEmail},
      include: {
        memberships: {
          where: {isActive: true},
          include: {dealer: {select: {name: true, deletedAt: true}}},
        },
      },
    }),
  ]);

  // Slug/domain already taken
  if (existingDealer || existingDomain) {
    const q = new URLSearchParams({view: "dealers", dealerError: "slug_taken", conflictSlug: finalSlug});
    redirect(`/admin?${q.toString()}`);
  }

  // Email belongs to an admin/platform user — cannot reuse
  if (existingOwner?.platformRole) {
    const q = new URLSearchParams({view: "dealers", dealerError: "email_admin", conflictEmail: parsed.data.ownerEmail});
    redirect(`/admin?${q.toString()}`);
  }

  // Email already used by an ACTIVE (non-deleted) dealer
  const activeConflictMembership = existingOwner?.memberships.find((m) => !m.dealer.deletedAt);
  if (activeConflictMembership) {
    const q = new URLSearchParams({
      view: "dealers",
      dealerError: "email_taken",
      conflictEmail: parsed.data.ownerEmail,
      conflictDealer: activeConflictMembership.dealer.name,
    });
    redirect(`/admin?${q.toString()}`);
  }

  // Email exists but user's dealer was deleted — safe to reuse the account
  const reuseExistingUser = Boolean(existingOwner);

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

      // Reuse existing user (previous dealer was deleted) or create fresh
      let owner: {id: string};
      if (reuseExistingUser && existingOwner) {
        owner = await tx.adminUser.update({
          where: {id: existingOwner.id},
          data: {
            passwordHash,
            firstName: parsed.data.ownerFirstName ?? existingOwner.firstName,
            lastName: parsed.data.ownerLastName ?? existingOwner.lastName,
            isActive: true,
          },
          select: {id: true},
        });
      } else {
        owner = await tx.adminUser.create({
          data: {
            email: parsed.data.ownerEmail,
            passwordHash,
            firstName: parsed.data.ownerFirstName,
            lastName: parsed.data.ownerLastName,
            isActive: true,
          },
          select: {id: true},
        });
      }

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
            reusedAccount: reuseExistingUser,
          } as never,
        },
      });

      if (parsed.data.partnerLeadId) {
        await tx.partnerLead.updateMany({
          where: {
            id: parsed.data.partnerLeadId,
            deletedAt: null,
          },
          data: {
            convertedDealerId: dealer.id,
            status: "APPROVED",
            archived: true,
            decisionAt: new Date(),
          },
        });
      }
    });
  } catch (err) {
    console.error("[createDealerProvisionAction] transaction failed:", err);
    redirect("/admin?view=dealers&dealerError=unknown");
  }

  const query = new URLSearchParams({
    view: "dealers",
    dealerCreated: finalSlug,
    ownerEmail: parsed.data.ownerEmail,
    ownerPassword: finalPassword,
  });
  redirect(`/admin?${query.toString()}`);
}

export async function createPlatformVehicleAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();
  let platformDealer;
  try {
    platformDealer = await getPlatformDealerOrThrow();
  } catch {
    redirectVehicleState("platform");
  }
  const safePlatformDealer = platformDealer!;

  const parsed = getVehicleFormInput(formData);
  if (!parsed) {
    redirectVehicleState("validation");
  }
  const validParsed = parsed!;

  const media = await collectVehicleMedia(formData, validParsed);
  if (!media) {
    redirectVehicleState("validation");
  }
  const validMedia = media!;

  let slug = slugify(validParsed.title);
  if (!slug) slug = uniqueSlug("vehicle");

  const existing = await prisma.vehicle.findFirst({
    where: {dealerId: safePlatformDealer.id, slug, deletedAt: null},
    select: {id: true},
  });

  if (existing) slug = uniqueSlug(slug);

  const vehicle = await prisma.vehicle.create({
    data: {
      dealerId: safePlatformDealer.id,
      slug,
      title: validParsed.title,
      stockNumber: validParsed.stockNumber,
      make: validParsed.make,
      model: validParsed.model,
      year: validParsed.year,
      mileageKm: validParsed.mileageKm,
      fuel: validParsed.fuel,
      transmission: validParsed.transmission,
      vinLast6: validParsed.vinLast6,
      priceCzk: validParsed.priceCzk,
      imageUrl: validMedia.primaryImage,
      videoUrl: validMedia.primaryVideo,
      videoGallery: validMedia.galleryVideos.length
        ? (validMedia.galleryVideos as unknown as Prisma.InputJsonValue)
        : undefined,
      description: validParsed.description,
      leasingEligible: Boolean(validParsed.leasingEligible),
      availability: validParsed.availability,
      published: validParsed.availability === "SOLD" ? false : Boolean(validParsed.published),
      featured: Boolean(validParsed.featured),
      images: validMedia.galleryImages.length
        ? {
            create: validMedia.galleryImages.map((url, index) => ({
              url,
              alt: validParsed.title,
              sortOrder: index,
            })),
          }
        : undefined,
    },
  });

  await writeAuditLog({
    action: "VEHICLE_CREATED",
    actorUserId: user.id,
    dealerId: safePlatformDealer.id,
    vehicleId: vehicle.id,
    message: `Central CRM created platform vehicle ${vehicle.title}.`,
  });

  revalidatePath("/admin");
  revalidateFleetPages();
  redirectVehicleState("created");
}

export async function updatePlatformVehicleAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();
  let platformDealer;
  try {
    platformDealer = await getPlatformDealerOrThrow();
  } catch {
    redirectVehicleState("platform");
  }
  const safePlatformDealer = platformDealer!;

  const idSchema = z.object({id: z.string().min(1)});
  const parsedId = idSchema.safeParse({id: String(formData.get("id") ?? "")});
  const parsed = getVehicleFormInput(formData);
  if (!parsedId.success || !parsed) {
    redirectVehicleState("validation");
  }
  const validParsedId = parsedId.data!;
  const validParsed = parsed!;

  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      id: validParsedId.id,
      dealerId: safePlatformDealer.id,
      deletedAt: null,
    },
    include: {
      images: {
        orderBy: {sortOrder: "asc"},
      },
    },
  });

  if (!existingVehicle) {
    redirectVehicleState("platform");
  }
  const validExistingVehicle = existingVehicle!;

  const media = await collectVehicleMedia(formData, validParsed);
  if (!media) {
    redirectVehicleState("validation");
  }
  const validMedia = media!;

  await prisma.vehicle.update({
    where: {id: validExistingVehicle.id},
    data: {
      title: validParsed.title,
      stockNumber: validParsed.stockNumber,
      make: validParsed.make,
      model: validParsed.model,
      year: validParsed.year,
      mileageKm: validParsed.mileageKm,
      fuel: validParsed.fuel,
      transmission: validParsed.transmission,
      vinLast6: validParsed.vinLast6,
      priceCzk: validParsed.priceCzk,
      imageUrl: validMedia.primaryImage,
      videoUrl: validMedia.primaryVideo,
      videoGallery: validMedia.galleryVideos.length
        ? (validMedia.galleryVideos as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      description: validParsed.description,
      availability: validParsed.availability,
      published: validParsed.availability === "SOLD" ? false : Boolean(validParsed.published),
      featured: Boolean(validParsed.featured),
      leasingEligible: Boolean(validParsed.leasingEligible),
      images: {
        deleteMany: {},
        create: validMedia.galleryImages.map((url, index) => ({
          url,
          alt: validParsed.title,
          sortOrder: index,
        })),
      },
    },
  });

  await writeAuditLog({
    action: "VEHICLE_UPDATED",
    actorUserId: user.id,
    dealerId: safePlatformDealer.id,
    vehicleId: validExistingVehicle.id,
    message: "Central CRM updated platform vehicle.",
  });

  revalidatePath("/admin");
  revalidateFleetPages();
  redirectVehicleState("updated");
}

export async function markPlatformVehicleSoldAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();
  const platformDealer = await getPlatformDealerOrThrow();

  const vehicleId = String(formData.get("id") ?? "").trim();
  if (!vehicleId) redirectVehicleState("platform");

  const updated = await prisma.vehicle.updateMany({
    where: {
      id: vehicleId,
      dealerId: platformDealer.id,
      deletedAt: null,
    },
    data: {
      availability: "SOLD",
      published: false,
    },
  });

  if (updated.count === 0) {
    redirectVehicleState("platform");
  }

  await writeAuditLog({
    action: "VEHICLE_UPDATED",
    actorUserId: user.id,
    dealerId: platformDealer.id,
    vehicleId: vehicleId,
    message: "Central CRM marked platform vehicle as sold.",
  });

  revalidateFleetPages();
  redirectVehicleState("updated");
}

export async function deletePlatformVehicleAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();
  const platformDealer = await getPlatformDealerOrThrow();

  const vehicleId = String(formData.get("id") ?? "").trim();
  if (!vehicleId) redirectVehicleState("platform");

  const updated = await prisma.vehicle.updateMany({
    where: {id: vehicleId, dealerId: platformDealer.id, deletedAt: null},
    data: {deletedAt: new Date(), published: false},
  });

  if (updated.count === 0) {
    redirectVehicleState("platform");
  }

  await writeAuditLog({
    action: "VEHICLE_ARCHIVED",
    actorUserId: user.id,
    dealerId: platformDealer.id,
    vehicleId: vehicleId,
    message: "Central CRM deleted platform vehicle listing.",
  });

  revalidateFleetPages();
  redirectVehicleState("updated");
}

export async function createCareerVacancyAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();
  const platformDealer = await getPlatformDealerOrThrow();

  const schema = z.object({
    title: z.string().min(3).max(160),
    city: z.string().max(80).optional(),
    employmentType: z.string().max(80).optional(),
    salary: z.string().max(160).optional(),
    description: z.string().max(5000).optional(),
    contactEmail: z.string().email().max(200).optional(),
    sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
    published: z.string().optional(),
  });

  const parsed = schema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim() || undefined,
    employmentType: String(formData.get("employmentType") ?? "").trim() || undefined,
    salary: String(formData.get("salary") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    contactEmail: String(formData.get("contactEmail") ?? "").trim() || undefined,
    sortOrder: String(formData.get("sortOrder") ?? "").trim() || undefined,
    published: formData.get("published") ? "on" : undefined,
  });

  if (!parsed.success) {
    redirectVacancyState("validation");
  }
  const validParsed = parsed.data!;

  const vacancy = await prisma.vacancy.create({
    data: {
      dealerId: platformDealer.id,
      title: validParsed.title,
      city: validParsed.city,
      employmentType: validParsed.employmentType,
      salary: validParsed.salary,
      description: validParsed.description,
      contactEmail: validParsed.contactEmail,
      sortOrder: validParsed.sortOrder ?? 0,
      published: Boolean(validParsed.published),
    },
  });

  await writeAuditLog({
    action: "VACANCY_CREATED",
    actorUserId: user.id,
    dealerId: platformDealer.id,
    message: `Central CRM created vacancy ${vacancy.title}.`,
  });

  revalidatePath("/admin");
  await revalidateCareerPages();
  redirectVacancyState("created");
}

export async function updateCareerVacancyAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    title: z.string().min(3).max(160),
    city: z.string().max(80).optional(),
    employmentType: z.string().max(80).optional(),
    salary: z.string().max(160).optional(),
    description: z.string().max(5000).optional(),
    contactEmail: z.string().email().max(200).optional(),
    sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
    published: z.string().optional(),
  });

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim() || undefined,
    employmentType: String(formData.get("employmentType") ?? "").trim() || undefined,
    salary: String(formData.get("salary") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    contactEmail: String(formData.get("contactEmail") ?? "").trim() || undefined,
    sortOrder: String(formData.get("sortOrder") ?? "").trim() || undefined,
    published: formData.get("published") ? "on" : undefined,
  });

  if (!parsed.success) {
    redirectVacancyState("validation");
  }
  const validParsed = parsed.data!;

  const platformDealer2 = await getPlatformDealerOrThrow();
  const vacancy = await prisma.vacancy.update({
    where: {id: validParsed.id, dealerId: platformDealer2.id},
    data: {
      title: validParsed.title,
      city: validParsed.city,
      employmentType: validParsed.employmentType,
      salary: validParsed.salary,
      description: validParsed.description,
      contactEmail: validParsed.contactEmail,
      sortOrder: validParsed.sortOrder ?? 0,
      published: Boolean(validParsed.published),
    },
  });

  await writeAuditLog({
    action: "VACANCY_UPDATED",
    actorUserId: user.id,
    dealerId: vacancy.dealerId,
    message: `Central CRM updated vacancy ${vacancy.title}.`,
  });

  revalidatePath("/admin");
  await revalidateCareerPages();
  redirectVacancyState("updated");
}

export async function archiveCareerVacancyAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({id: z.string().min(1)});
  const parsed = schema.safeParse({id: String(formData.get("id") ?? "")});
  if (!parsed.success) return;

  const platformDealer = await getPlatformDealerOrThrow();
  const updated = await prisma.vacancy.updateMany({
    where: {id: parsed.data.id, dealerId: platformDealer.id, deletedAt: null},
    data: {deletedAt: new Date(), published: false},
  });

  if (updated.count === 0) {
    redirectVacancyState("validation");
  }

  await writeAuditLog({
    action: "VACANCY_ARCHIVED",
    actorUserId: user.id,
    dealerId: platformDealer.id,
    message: `Central CRM archived vacancy ${parsed.data.id}.`,
  });

  revalidatePath("/admin");
  await revalidateCareerPages();
  redirectVacancyState("updated");
}

export async function updateDealerSettingsAction(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();

  const VALID_REGIONS = [
    "Praha", "STREDOCESKY", "JIHOCESKY", "PLZENSKY", "KARLOVARSKY",
    "USTECKY", "LIBERECKY", "KRALOVEHRADECKY", "PARDUBICKY", "VYSOCINA",
    "JIHOMORAVSKY", "OLOMOUCKY", "ZLINSKY", "MORAVSKOSLEZSKY",
  ] as const;

  const schema = z.object({
    id: z.string().min(1),
    region: z.enum(VALID_REGIONS).nullable().optional(),
    homeDelivery: z.string().optional(),
  });
  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    region: (formData.get("region") as string) || null,
    homeDelivery: formData.get("homeDelivery") as string | undefined,
  });
  if (!parsed.success) {
    redirect(`/admin/dealers/${String(formData.get("id") ?? "")}`);
  }

  await prisma.dealer.update({
    where: {id: parsed.data.id},
    data: {
      region: parsed.data.region ?? null,
      homeDelivery: parsed.data.homeDelivery === "on" || parsed.data.homeDelivery === "true",
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/dealers/${parsed.data.id}?updated=1`);
}

export async function deactivateDealerAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({id: z.string().min(1)});
  const parsed = schema.safeParse({id: String(formData.get("id") ?? "")});
  if (!parsed.success) return;

  const dealer = await prisma.dealer.findFirst({
    where: {id: parsed.data.id, deletedAt: null},
  });
  if (!dealer || dealer.slug === getPlatformDealerSlug()) {
    revalidatePath("/admin");
    return;
  }

  await prisma.dealer.update({
    where: {id: parsed.data.id},
    data: {status: "INACTIVE"},
  });

  await writeAuditLog({
    action: "DEALER_DEACTIVATED",
    actorUserId: user.id,
    dealerId: parsed.data.id,
    message: "Central CRM deactivated dealer account.",
  });

  revalidatePath("/admin");
  redirect("/admin?view=dealers&dealerAction=deactivated");
}

export async function reactivateDealerAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({id: z.string().min(1)});
  const parsed = schema.safeParse({id: String(formData.get("id") ?? "")});
  if (!parsed.success) return;

  const dealer = await prisma.dealer.findFirst({
    where: {id: parsed.data.id, deletedAt: null},
  });
  if (!dealer) return;

  await prisma.$transaction(async (tx) => {
    await tx.dealer.update({
      where: {id: parsed.data.id},
      data: {status: "ACTIVE"},
    });
    // Restore memberships that were deactivated when dealer was deleted
    await tx.dealerMembership.updateMany({
      where: {dealerId: parsed.data.id},
      data: {isActive: true},
    });
  });

  await writeAuditLog({
    action: "DEALER_REACTIVATED",
    actorUserId: user.id,
    dealerId: parsed.data.id,
    message: "Central CRM reactivated dealer account and restored memberships.",
  });

  revalidatePath("/admin");
  redirect("/admin?view=dealers&dealerAction=reactivated");
}

export async function deleteDealerAction(formData: FormData) {
  const user = await requireAdmin();
  await assertSameOrigin();

  const schema = z.object({id: z.string().min(1)});
  const parsed = schema.safeParse({id: String(formData.get("id") ?? "")});
  if (!parsed.success) redirect("/admin?view=dealers");

  const dealer = await prisma.dealer.findFirst({
    where: {id: parsed.data.id, deletedAt: null},
  });
  if (!dealer || dealer.slug === getPlatformDealerSlug()) {
    redirect("/admin?view=dealers");
  }

  await prisma.$transaction(async (tx) => {
    await tx.dealerMembership.updateMany({
      where: {dealerId: parsed.data.id},
      data: {isActive: false},
    });
    await tx.dealer.update({
      where: {id: parsed.data.id},
      data: {status: "INACTIVE", deletedAt: new Date()},
    });
    await tx.auditLog.create({
      data: {
        action: "DEALER_DELETED",
        actorType: "SYSTEM",
        actorUserId: user.id,
        dealerId: parsed.data.id,
        targetId: parsed.data.id,
        message: `Central CRM deleted dealer ${dealer.name}.`,
        metadata: {} as never,
      },
    });
  });

  redirect("/admin?view=dealers&dealerDeleted=1");
}

export async function resetDealerPasswordAction(formData: FormData) {
  const adminUser = await requireAdmin();
  await assertSameOrigin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin?view=dealers");

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  const {randomBytes} = await import("node:crypto");
  const buf = randomBytes(18);
  let newPassword = "";
  for (const byte of buf) {
    newPassword += chars[byte % chars.length];
    if (newPassword.length === 12) break;
  }

  const membership = await prisma.dealerMembership.findFirst({
    where: {dealerId: id, role: "DEALER_OWNER", isActive: true},
  });
  if (!membership) redirect("/admin?view=dealers");

  const passwordHash = await hash(newPassword, 12);
  await prisma.adminUser.update({
    where: {id: membership.userId},
    data: {passwordHash},
  });

  await writeAuditLog({
    action: "DEALER_PASSWORD_RESET",
    actorUserId: adminUser.id,
    dealerId: id,
    message: "Admin reset dealer owner password.",
  });

  redirect(`/admin?view=dealers&newPwdDealerId=${id}&newPwd=${encodeURIComponent(newPassword)}`);
}
