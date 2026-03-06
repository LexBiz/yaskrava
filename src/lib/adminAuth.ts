import "server-only";

import {clearSession, createSession, getCurrentUser, requireCentralUser} from "@/lib/auth";

export async function isAdmin() {
  const user = await getCurrentUser();
  return Boolean(user?.platformRole);
}

export async function requireAdmin() {
  return requireCentralUser();
}

export async function setAdminCookie(userId: string) {
  await createSession(userId);
}

export async function clearAdminCookie() {
  await clearSession();
}

