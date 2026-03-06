import crypto from "node:crypto";

import {headers} from "next/headers";

function normalizeHost(host: string) {
  return host.replace(/:\d+$/, "").toLowerCase();
}

export async function assertSameOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!origin || !host) {
    return;
  }

  const originHost = normalizeHost(new URL(origin).host);
  const requestHost = normalizeHost(host);

  if (originHost !== requestHost) {
    throw new Error("INVALID_ORIGIN");
  }
}

export async function getClientIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return headerStore.get("x-real-ip") ?? "unknown";
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
