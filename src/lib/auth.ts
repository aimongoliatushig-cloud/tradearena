import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

const SESSION_COOKIE = "ftmo_admin_session";
const SESSION_DURATION_DAYS = 14;

function getSessionSecret() {
  return new TextEncoder().encode(env.ADMIN_SESSION_SECRET);
}

async function sha256(input: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(userId: string) {
  const sessionId = crypto.randomUUID();
  const token = await new SignJWT({ sessionId, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSessionSecret());

  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.adminSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = await sha256(token);
    await db.adminSession.deleteMany({
      where: { tokenHash },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSessionSecret());
    const tokenHash = await sha256(token);

    const session = await db.adminSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    await db.adminSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return {
      sessionId: verified.payload.sessionId as string,
      user: session.user,
    };
  } catch {
    return null;
  }
}

export async function requireAdminUser() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session.user;
}
