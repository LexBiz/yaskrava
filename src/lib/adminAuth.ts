import "server-only";

import crypto from "node:crypto";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

const COOKIE_NAME = "yaskrava_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.ADMIN_SECRET || "dev-secret-change-me";
}

export function getAdminPin() {
  return process.env.ADMIN_PIN || "1111";
}

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function sign(value: string) {
  return base64url(crypto.createHmac("sha256", getSecret()).update(value).digest());
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function createAdminSession() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `exp=${exp}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token: string | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload);
  if (!timingSafeEqual(expected, sig)) return false;

  const match = payload.match(/exp=(\d+)/);
  if (!match) return false;
  const exp = Number(match[1]);
  if (!Number.isFinite(exp)) return false;

  return Math.floor(Date.now() / 1000) < exp;
}

export async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminSession(token);
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

export async function setAdminCookie() {
  const token = createAdminSession();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

