import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export type SessionKind = "clerk" | "admin";

export type SessionPayload = {
  kind: SessionKind;
  id: number;
  expiresAt: number;
};

const SESSION_COOKIE = "zera_session";
const SESSION_DAYS = 7;

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET is not set");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    if (
      typeof payload.kind !== "string" ||
      (payload.kind !== "clerk" && payload.kind !== "admin") ||
      typeof payload.id !== "number" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }
    return { kind: payload.kind, id: payload.id, expiresAt: payload.expiresAt };
  } catch {
    return null;
  }
}

export async function createSession(kind: SessionKind, id: number): Promise<void> {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const token = await encryptSession({ kind, id, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return decryptSession(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
