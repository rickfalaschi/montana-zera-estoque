"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNull, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { db } from "@/lib/db";
import {
  administrators,
  clerks,
  passwordResetTokens,
} from "@/lib/db/schema";
import { generateResetToken, hashToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mailer";

export type RequestFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  sent?: boolean;
} | null;

export type ResetFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

const TOKEN_TTL_MS = 60 * 60 * 1000;

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
});

const resetSchema = z
  .object({
    password: z.string().min(6, "Senha com no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

async function getBaseUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function findUser(
  kind: "clerk" | "admin",
  email: string
): Promise<{ id: number; name: string; email: string } | null> {
  if (kind === "clerk") {
    const [row] = await db
      .select({
        id: clerks.id,
        name: clerks.name,
        email: clerks.email,
      })
      .from(clerks)
      .where(eq(clerks.email, email))
      .limit(1);
    return row ?? null;
  }
  const [row] = await db
    .select({
      id: administrators.id,
      name: administrators.name,
      email: administrators.email,
    })
    .from(administrators)
    .where(eq(administrators.email, email))
    .limit(1);
  return row ?? null;
}

async function createResetToken(kind: "clerk" | "admin", userId: number) {
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.userKind, kind),
        eq(passwordResetTokens.userId, userId),
        isNull(passwordResetTokens.usedAt)
      )
    );
  const { raw, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await db.insert(passwordResetTokens).values({
    tokenHash: hash,
    userKind: kind,
    userId,
    expiresAt,
  });
  return raw;
}

async function requestReset(
  kind: "clerk" | "admin",
  formData: FormData
): Promise<RequestFormState> {
  const parsed = requestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email } = parsed.data;

  const user = await findUser(kind, email);
  if (user) {
    try {
      const token = await createResetToken(kind, user.id);
      const baseUrl = await getBaseUrl();
      const path =
        kind === "admin" ? "/admin/recuperar-senha" : "/recuperar-senha";
      const url = `${baseUrl}${path}/${token}`;
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
        kind,
      });
    } catch (err) {
      console.error("password reset email failed:", err);
      return {
        error:
          "Não foi possível enviar o email agora. Tente novamente em alguns minutos.",
      };
    }
  }

  return { sent: true };
}

export async function requestClerkPasswordReset(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  return requestReset("clerk", formData);
}

export async function requestAdminPasswordReset(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  return requestReset("admin", formData);
}

export type VerifiedToken = {
  kind: "clerk" | "admin";
  userId: number;
  tokenId: number;
};

export async function verifyResetToken(
  rawToken: string
): Promise<VerifiedToken | null> {
  if (!rawToken || rawToken.length < 32) return null;
  const hash = hashToken(rawToken);
  const [row] = await db
    .select({
      id: passwordResetTokens.id,
      userKind: passwordResetTokens.userKind,
      userId: passwordResetTokens.userId,
      expiresAt: passwordResetTokens.expiresAt,
      usedAt: passwordResetTokens.usedAt,
    })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, hash))
    .limit(1);
  if (!row) return null;
  if (row.usedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  if (row.userKind !== "clerk" && row.userKind !== "admin") return null;
  return {
    kind: row.userKind,
    userId: row.userId,
    tokenId: row.id,
  };
}

async function applyResetPassword(
  kind: "clerk" | "admin",
  rawToken: string,
  formData: FormData
): Promise<ResetFormState> {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const verified = await verifyResetToken(rawToken);
  if (!verified || verified.kind !== kind) {
    return {
      error:
        "Link inválido ou expirado. Solicite uma nova redefinição de senha.",
    };
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  if (kind === "clerk") {
    await db
      .update(clerks)
      .set({ passwordHash: hash })
      .where(eq(clerks.id, verified.userId));
  } else {
    await db
      .update(administrators)
      .set({ passwordHash: hash })
      .where(eq(administrators.id, verified.userId));
  }
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, verified.tokenId));

  redirect(kind === "admin" ? "/admin/login?reset=ok" : "/login?reset=ok");
}

export async function resetClerkPassword(
  token: string,
  _prev: ResetFormState,
  formData: FormData
): Promise<ResetFormState> {
  return applyResetPassword("clerk", token, formData);
}

export async function resetAdminPassword(
  token: string,
  _prev: ResetFormState,
  formData: FormData
): Promise<ResetFormState> {
  return applyResetPassword("admin", token, formData);
}

// Utilitário: limpar tokens expirados (chamável por cron futuro)
export async function purgeExpiredTokens(): Promise<void> {
  await db
    .delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date()));
}
