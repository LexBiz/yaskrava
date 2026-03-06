"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {z} from "zod";

import {authenticateWithPassword, clearSession, createSession, requireDealerUser} from "@/lib/auth";
import {writeAuditLog} from "@/lib/audit";
import {prisma} from "@/lib/prisma";
import {assertRateLimit} from "@/lib/rateLimit";
import {assertSameOrigin, getClientIp} from "@/lib/security";
import {slugify, uniqueSlug} from "@/lib/slug";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

export async function dealerLoginAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    redirect("/dealer/login?error=validation");
  }

  const ip = await getClientIp();
  try {
    assertRateLimit({
      key: `dealer-login:${dealer.id}:${ip}`,
      limit: 10,
      windowMs: 1000 * 60 * 15,
    });
  } catch {
    redirect("/dealer/login?error=rate");
  }

  const user = await authenticateWithPassword(parsed.data.email, parsed.data.password);
  if (!user) {
    redirect("/dealer/login?error=credentials");
  }

  const membership = user.memberships.find(
    (item) => item.dealerId === dealer.id && item.isActive
  );

  if (!membership && !user.platformRole) {
    redirect("/dealer/login?error=dealer");
  }

  await createSession(user.id);
  await writeAuditLog({
    action: "USER_LOGIN",
    actorUserId: user.id,
    dealerId: dealer.id,
    message: "Dealer CRM login",
  });
  redirect("/dealer");
}

export async function dealerLogoutAction() {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await clearSession();
  await writeAuditLog({
    action: "USER_LOGOUT",
    actorUserId: user.id,
    dealerId: dealer.id,
    message: "Dealer CRM logout",
  });
  redirect("/dealer/login");
}

export async function setDealerApplicationStatusAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    status: z.enum(["NEW", "IN_REVIEW", "NEED_INFO", "CONTACTED", "APPROVED", "REJECTED"]),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });

  const updated = await prisma.application.updateMany({
    where: {
      id: parsed.id,
      dealerId: dealer.id,
      deletedAt: null,
    },
    data: {
      status: parsed.status,
      contactedAt: parsed.status === "CONTACTED" ? new Date() : undefined,
      decisionAt:
        parsed.status === "APPROVED" || parsed.status === "REJECTED"
          ? new Date()
          : undefined,
    },
  });

  if (updated.count === 0) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  await writeAuditLog({
    action: "APPLICATION_STATUS_UPDATED",
    actorUserId: user.id,
    dealerId: dealer.id,
    applicationId: parsed.id,
    message: `Dealer CRM updated lead status to ${parsed.status}.`,
  });

  revalidatePath("/dealer");
}

export async function setDealerApplicationNoteAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({
    id: z.string().min(1),
    dealerNote: z.string().max(5000).optional(),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
    dealerNote: String(formData.get("dealerNote") ?? "").trim() || undefined,
  });

  const updated = await prisma.application.updateMany({
    where: {
      id: parsed.id,
      dealerId: dealer.id,
      deletedAt: null,
    },
    data: {
      dealerNote: parsed.dealerNote,
    },
  });

  if (updated.count === 0) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  await writeAuditLog({
    action: "APPLICATION_NOTE_UPDATED",
    actorUserId: user.id,
    dealerId: dealer.id,
    applicationId: parsed.id,
    message: "Dealer CRM updated dealer note.",
  });

  revalidatePath("/dealer");
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

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
    availability: String(formData.get("availability") ?? ""),
    published: formData.get("published") ? "on" : undefined,
    featured: formData.get("featured") ? "on" : undefined,
  });

  const updated = await prisma.vehicle.updateMany({
    where: {
      id: parsed.id,
      dealerId: dealer.id,
      deletedAt: null,
    },
    data: {
      availability: parsed.availability,
      published: Boolean(parsed.published),
      featured: Boolean(parsed.featured),
    },
  });

  if (updated.count === 0) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  await writeAuditLog({
    action: "VEHICLE_UPDATED",
    actorUserId: user.id,
    dealerId: dealer.id,
    vehicleId: parsed.id,
    message: "Dealer CRM updated vehicle visibility or availability.",
  });

  revalidatePath("/dealer");
}

export async function createDealerVehicleAction(formData: FormData) {
  const dealer = await getCurrentDealerOrThrow();
  const {user} = await requireDealerUser(dealer.id);
  await assertSameOrigin();

  const schema = z.object({
    title: z.string().min(3).max(160),
    make: z.string().max(80).optional(),
    model: z.string().max(80).optional(),
    year: z.coerce.number().int().min(1950).max(2100).optional(),
    mileageKm: z.coerce.number().int().min(0).max(2_000_000).optional(),
    fuel: z.string().max(40).optional(),
    transmission: z.string().max(40).optional(),
    priceCzk: z.coerce.number().int().min(0).max(100_000_000).optional(),
    imageUrl: z.string().url().max(2000).optional(),
    description: z.string().max(5000).optional(),
    availability: z.enum(["IN_TRANSIT", "ON_SITE", "SOLD"]).default("ON_SITE"),
  });

  const parsed = schema.parse({
    title: String(formData.get("title") ?? "").trim(),
    make: String(formData.get("make") ?? "").trim() || undefined,
    model: String(formData.get("model") ?? "").trim() || undefined,
    year: String(formData.get("year") ?? "").trim() || undefined,
    mileageKm: String(formData.get("mileageKm") ?? "").trim() || undefined,
    fuel: String(formData.get("fuel") ?? "").trim() || undefined,
    transmission: String(formData.get("transmission") ?? "").trim() || undefined,
    priceCzk: String(formData.get("priceCzk") ?? "").trim() || undefined,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    availability: String(formData.get("availability") ?? "ON_SITE"),
  });

  let slug = slugify(parsed.title);
  if (!slug) {
    slug = uniqueSlug("vehicle");
  }

  const existing = await prisma.vehicle.findFirst({
    where: {
      dealerId: dealer.id,
      slug,
    },
    select: {id: true},
  });

  if (existing) {
    slug = uniqueSlug(slug);
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      dealerId: dealer.id,
      slug,
      title: parsed.title,
      make: parsed.make,
      model: parsed.model,
      year: parsed.year,
      mileageKm: parsed.mileageKm,
      fuel: parsed.fuel,
      transmission: parsed.transmission,
      priceCzk: parsed.priceCzk,
      imageUrl: parsed.imageUrl,
      description: parsed.description,
      availability: parsed.availability,
      published: true,
    },
  });

  await writeAuditLog({
    action: "VEHICLE_CREATED",
    actorUserId: user.id,
    dealerId: dealer.id,
    vehicleId: vehicle.id,
    message: `Dealer CRM created vehicle ${vehicle.title}.`,
  });

  revalidatePath("/dealer");
}
