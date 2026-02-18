"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {z} from "zod";

import {requireAdmin, setAdminCookie, clearAdminCookie, getAdminPin} from "@/lib/adminAuth";
import {prisma} from "@/lib/prisma";

export async function adminLoginAction(formData: FormData) {
  const schema = z.object({
    pin: z.string().min(1),
  });

  const parsed = schema.safeParse({
    pin: String(formData.get("pin") ?? ""),
  });

  if (!parsed.success) {
    redirect("/admin/login?error=1");
  }

  if (parsed.data.pin !== getAdminPin()) {
    redirect("/admin/login?error=1");
  }

  await setAdminCookie();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await requireAdmin();
  await clearAdminCookie();
  redirect("/admin/login");
}

export async function setApplicationStatusAction(formData: FormData) {
  await requireAdmin();

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
    data: {status: parsed.status},
  });

  revalidatePath("/admin");
}

export async function toggleArchivedAction(formData: FormData) {
  await requireAdmin();

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

  revalidatePath("/admin");
}

export async function deleteApplicationAction(formData: FormData) {
  await requireAdmin();

  const schema = z.object({
    id: z.string().min(1),
  });

  const parsed = schema.parse({
    id: String(formData.get("id") ?? ""),
  });

  await prisma.application.delete({where: {id: parsed.id}});
  revalidatePath("/admin");
}

export async function setAdminNoteAction(formData: FormData) {
  await requireAdmin();

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

  revalidatePath("/admin");
}

