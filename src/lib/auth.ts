"use server";

import "server-only";

import crypto from "node:crypto";

import {compare} from "bcryptjs";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

import {prisma} from "@/lib/prisma";
import {assertSameOrigin, sha256} from "@/lib/security";

const SESSION_COOKIE_NAME = "yaskrava_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type AuthenticatedUser = Awaited<ReturnType<typeof getCurrentUser>>;

function createRawSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function getSessionCookieValue() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function createSession(userId: string) {
  const rawToken = createRawSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: sha256(rawToken),
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  await assertSameOrigin();

  const rawToken = await getSessionCookieValue();
  if (rawToken) {
    await prisma.userSession.deleteMany({
      where: {
        tokenHash: sha256(rawToken),
      },
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const rawToken = await getSessionCookieValue();
  if (!rawToken) {
    return null;
  }

  const session = await prisma.userSession.findUnique({
    where: {
      tokenHash: sha256(rawToken),
    },
    include: {
      user: {
        include: {
          memberships: {
            where: {isActive: true},
            include: {
              dealer: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.userSession.delete({
      where: {id: session.id},
    });
    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  return session.user;
}

export async function authenticateWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.adminUser.findUnique({
    where: {email: normalizedEmail},
    include: {
      memberships: {
        where: {isActive: true},
        include: {dealer: true},
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const ok = await compare(password, user.passwordHash);
  if (!ok) {
    return null;
  }

  return user;
}

export async function requireCentralUser() {
  const user = await getCurrentUser();

  if (!user || !user.platformRole) {
    redirect("/admin/login");
  }

  return user;
}

export async function requireDealerUser(dealerId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/dealer/login");
  }

  const membership = user.memberships.find(
    (item) => item.dealerId === dealerId && item.isActive
  );

  if (!membership && !user.platformRole) {
    redirect("/dealer/login");
  }

  return {
    user,
    membership: membership ?? null,
  };
}
