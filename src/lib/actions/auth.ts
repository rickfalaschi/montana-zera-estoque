"use server";

import { redirect } from "next/navigation";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { administrators, clerks, stores } from "@/lib/db/schema";
import { createSession, destroySession, getSession } from "@/lib/session";
import { clerkSignupSchema, loginSchema } from "@/lib/validators";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: string;
} | null;

export async function signupClerk(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = clerkSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    cpf: formData.get("cpf"),
    storeCnpj: formData.get("storeCnpj"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, cpf, storeCnpj, password } = parsed.data;

  const [store] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.cnpj, storeCnpj))
    .limit(1);
  if (!store) {
    return {
      error: "Nenhuma loja cadastrada com esse CNPJ. Confira com o gerente.",
    };
  }

  const [existing] = await db
    .select({ id: clerks.id })
    .from(clerks)
    .where(or(eq(clerks.email, email), eq(clerks.cpf, cpf)))
    .limit(1);
  if (existing) {
    return { error: "Já existe um cadastro com esse email ou CPF." };
  }

  const hash = await bcrypt.hash(password, 10);
  await db.insert(clerks).values({
    name,
    email,
    cpf,
    passwordHash: hash,
    storeId: store.id,
    isManager: false,
    isApproved: false,
  });
  redirect("/cadastro/pendente");
}

export async function loginClerk(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  const [clerk] = await db
    .select({
      id: clerks.id,
      passwordHash: clerks.passwordHash,
      isApproved: clerks.isApproved,
    })
    .from(clerks)
    .where(eq(clerks.email, email))
    .limit(1);
  if (!clerk) return { error: "Email ou senha incorretos." };

  const ok = await bcrypt.compare(password, clerk.passwordHash);
  if (!ok) return { error: "Email ou senha incorretos." };
  if (!clerk.isApproved) {
    return {
      error:
        "Seu cadastro ainda não foi aprovado pelo gerente da loja. Volte em alguns instantes.",
    };
  }
  await createSession("clerk", clerk.id);
  redirect("/painel");
}

export async function loginAdmin(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  const [admin] = await db
    .select({ id: administrators.id, passwordHash: administrators.passwordHash })
    .from(administrators)
    .where(eq(administrators.email, email))
    .limit(1);
  if (!admin) return { error: "Email ou senha incorretos." };

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return { error: "Email ou senha incorretos." };
  await createSession("admin", admin.id);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const session = await getSession();
  await destroySession();
  if (session?.kind === "admin") redirect("/admin/login");
  redirect("/login");
}
