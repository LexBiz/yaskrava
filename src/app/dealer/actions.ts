"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {z} from "zod";

import {authenticateWithPassword, clearSession, createSession, requireDealerUser} from "@/lib/auth";
import {writeAuditLog} from "@/lib/audit";
import {prisma} from "@/lib/prisma";
import {assertRateLimit} from "@/lib/rateLimit";
import {resolveDealerCrmLocale} from "@/lib/crmCopy";
import {assertSameOrigin, getClientIp} from "@/lib/security";
import {slugify, uniqueSlug} from "@/lib/slug";
import {getCurrentDealerOrThrow} from "@/lib/tenant";
import {saveVehicleImages, saveVehicleVideo} from "@/lib/uploads";
import {asFiles} from "@/lib/vehicleMedia";

const MAX_VEHICLE_IMAGES = 10;

function dealerReturnUrl(formData: FormData): string {
  const lang = resolveDealerCrmLocale(String(formData.get("_lang") ?? ""));
  const inv = String(formData.get("_inventory") ?? "");
  const validInv = ["all", "on_site", "in_transit", "sold"].includes(inv) ? inv : "all";
  return `/dealer?lang=${lang}&inventory=${validInv}`;
}

export async function dealerLoginAction(formData: FormData) {
  await assertSameOrigin();
  const dealer = await getCurrentDealerOrThrow();
  const lang = resolveDealerCrmLocale(String(formData.get("lang") ?? ""));
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    redirect(`/dealer/login?lang=${lang}&error=validation`);
  }

  const ip = await getClientIp();
  try {
    assertRateLimit({
      key: `dealer-login:${dealer.id}:${ip}`,
      limit: 10,
      windowMs: 1000 * 60 * 15,
    });
  } catch {
    redirect(`/dealer/login?lang=${lang}&error=rate`);
  }

  const user = await authenticateWithPassword(parsed.data.email, parsed.data.password);
  if (!user) {
    redirect(`/dealer/login?lang=${lang}&error=credentials`);
  }

  const membership = user.memberships.find(
    (item) => item.dealerId === dealer.id && item.isActive
  );

  if (!membership && !user.platformRole) {
    redirect(`/dealer/login?lang=${lang}&error=dealer`);
  }

  await createSession(user.id);
  await writeAuditLog({
    action: "USER_LOGIN",
    actorUserId: user.id,
    dealerId: dealer.id,
    message: "Dealer CRM login",
  });
  redirect(`/dealer?lang=${lang}`);
}

export async function dealerLogoutAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const lang = resolveDealerCrmLocale(String(formData.get("lang") ?? ""));
  const {user} = await requireDealerUser(dealer.id);
  await clearSession();
  await writeAuditLog({
    action: "USER_LOGOUT",
    actorUserId: user.id,
    dealerId: dealer.id,
    message: "Dealer CRM logout",
  });
  redirect(`/dealer/login?lang=${lang}`);
}

export async function setDealerApplicationStatusAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    status: z.enum(["NEW", "IN_REVIEW", "NEED_INFO", "CONTACTED", "APPROVED", "REJECTED"]),
  });

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });

  if (!parsed.success) {
    redirect(dealerReturnUrl(formData));
  }

  await prisma.application.updateMany({
    where: {id: parsed.data.id, dealerId: dealer.id, deletedAt: null},
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
    dealerId: dealer.id,
    applicationId: parsed.data.id,
    message: `Dealer CRM updated lead status to ${parsed.data.status}.`,
  });

  revalidatePath("/dealer");
  redirect(dealerReturnUrl(formData));
}

export async function setDealerApplicationNoteAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    dealerNote: z.string().max(5000).optional(),
  });

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    dealerNote: String(formData.get("dealerNote") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    redirect(dealerReturnUrl(formData));
  }

  await prisma.application.updateMany({
    where: {id: parsed.data.id, dealerId: dealer.id, deletedAt: null},
    data: {dealerNote: parsed.data.dealerNote},
  });

  await writeAuditLog({
    action: "APPLICATION_NOTE_UPDATED",
    actorUserId: user.id,
    dealerId: dealer.id,
    applicationId: parsed.data.id,
    message: "Dealer CRM updated dealer note.",
  });

  revalidatePath("/dealer");
  redirect(dealerReturnUrl(formData));
}

export async function updateDealerVehicleAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    availability: z.enum(["IN_TRANSIT", "ON_SITE", "SOLD"]),
    published: z.string().optional(),
    featured: z.string().optional(),
  });

  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? ""),
    availability: String(formData.get("availability") ?? ""),
    published: formData.get("published") ? "on" : undefined,
    featured: formData.get("featured") ? "on" : undefined,
  });

  if (!parsed.success) {
    redirect(dealerReturnUrl(formData));
  }

  await prisma.vehicle.updateMany({
    where: {id: parsed.data.id, dealerId: dealer.id, deletedAt: null},
    data: {
      availability: parsed.data.availability,
      published: parsed.data.availability === "SOLD" ? false : Boolean(parsed.data.published),
      featured: Boolean(parsed.data.featured),
    },
  });

  await writeAuditLog({
    action: "VEHICLE_UPDATED",
    actorUserId: user.id,
    dealerId: dealer.id,
    vehicleId: parsed.data.id,
    message: "Dealer CRM updated vehicle visibility or availability.",
  });

  revalidatePath("/dealer");
  redirect(dealerReturnUrl(formData));
}

export async function createDealerVehicleAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({
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
    // Accept any non-empty string (URL or path); don't enforce .url() to avoid false rejects
    imageUrl: z.string().max(2000).optional(),
    videoUrl: z.string().max(2000).optional(),
    description: z.string().max(5000).optional(),
    leasingEligible: z.string().optional(),
    availability: z.enum(["IN_TRANSIT", "ON_SITE", "SOLD"]).default("ON_SITE"),
    published: z.string().optional(),
  });

  const parsed = schema.safeParse({
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
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    leasingEligible: formData.get("leasingEligible") ? "on" : undefined,
    availability: String(formData.get("availability") ?? "ON_SITE"),
    published: formData.get("published") ? "on" : undefined,
  });

  if (!parsed.success) {
    redirect(dealerReturnUrl(formData));
  }

  const imageFileEntries = [
    ...formData.getAll("imageFiles"),
    formData.get("imageFile"),
  ].filter((entry): entry is FormDataEntryValue => entry !== null);
  const uploadedImages = await saveVehicleImages(
    asFiles(imageFileEntries).slice(0, MAX_VEHICLE_IMAGES)
  );

  const uploadedVideoUrl = await saveVehicleVideo(formData.get("videoFile") as File | null);

  const allImageUrls = [
    ...(parsed.data.imageUrl ? [parsed.data.imageUrl] : []),
    ...uploadedImages,
  ].slice(0, MAX_VEHICLE_IMAGES);

  const primaryImageUrl = allImageUrls[0];
  const primaryVideoUrl = uploadedVideoUrl || parsed.data.videoUrl;

  let slug = slugify(parsed.data.title);
  if (!slug) slug = uniqueSlug("vehicle");

  const existing = await prisma.vehicle.findFirst({
    where: {dealerId: dealer.id, slug, deletedAt: null},
    select: {id: true},
  });
  if (existing) slug = uniqueSlug(slug);

  const vehicle = await prisma.vehicle.create({
    data: {
      dealerId: dealer.id,
      slug,
      title: parsed.data.title,
      stockNumber: parsed.data.stockNumber,
      make: parsed.data.make,
      model: parsed.data.model,
      year: parsed.data.year,
      mileageKm: parsed.data.mileageKm,
      fuel: parsed.data.fuel,
      transmission: parsed.data.transmission,
      vinLast6: parsed.data.vinLast6,
      priceCzk: parsed.data.priceCzk,
      imageUrl: primaryImageUrl,
      videoUrl: primaryVideoUrl,
      description: parsed.data.description,
      leasingEligible: Boolean(parsed.data.leasingEligible),
      availability: parsed.data.availability,
      // default published=true unless user unchecked it
      published: parsed.data.published === undefined ? true : Boolean(parsed.data.published),
      images: allImageUrls.length
        ? {
            create: allImageUrls.map((url, index) => ({
              url,
              alt: parsed.data.title,
              sortOrder: index,
            })),
          }
        : undefined,
    },
  });

  await writeAuditLog({
    action: "VEHICLE_CREATED",
    actorUserId: user.id,
    dealerId: dealer.id,
    vehicleId: vehicle.id,
    message: `Dealer CRM created vehicle ${vehicle.title}.`,
  });

  const lang = resolveDealerCrmLocale(String(formData.get("_lang") ?? ""));
  revalidatePath("/dealer");
  redirect(`/dealer?lang=${lang}&vehicleAdded=1`);
}

export async function deleteDealerVehicleAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({id: z.string().min(1)});
  const parsed = schema.safeParse({id: String(formData.get("id") ?? "")});

  if (!parsed.success) {
    redirect(dealerReturnUrl(formData));
  }

  await prisma.vehicle.updateMany({
    where: {id: parsed.data.id, dealerId: dealer.id, deletedAt: null},
    data: {deletedAt: new Date(), published: false},
  });

  await writeAuditLog({
    action: "VEHICLE_ARCHIVED",
    actorUserId: user.id,
    dealerId: dealer.id,
    vehicleId: parsed.data.id,
    message: "Dealer CRM deleted vehicle listing.",
  });

  revalidatePath("/dealer");
  redirect(dealerReturnUrl(formData));
}

export async function markDealerVehicleSoldAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({id: z.string().min(1)});
  const parsed = schema.safeParse({id: String(formData.get("id") ?? "")});

  if (!parsed.success) {
    redirect(dealerReturnUrl(formData));
  }

  await prisma.vehicle.updateMany({
    where: {id: parsed.data.id, dealerId: dealer.id, deletedAt: null},
    data: {availability: "SOLD", published: false},
  });

  await writeAuditLog({
    action: "VEHICLE_UPDATED",
    actorUserId: user.id,
    dealerId: dealer.id,
    vehicleId: parsed.data.id,
    message: "Dealer CRM marked vehicle as sold.",
  });

  revalidatePath("/dealer");
  redirect(dealerReturnUrl(formData));
}
