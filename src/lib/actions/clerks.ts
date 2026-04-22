"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks } from "@/lib/db/schema";
import { requireManager } from "@/lib/dal";
import { clerkUpdateSchema } from "@/lib/validators";
import { onlyDigits } from "@/lib/format";

function normalizePhone(value: string | undefined): string | null {
  if (!value) return null;
  const digits = onlyDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return null;
  return digits;
}

function normalizeBirthDate(value: string | undefined): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function normalizeRg(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export type ClerkUpdateFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

export async function approveClerk(clerkId: number): Promise<void> {
  const manager = await requireManager();
  await db
    .update(clerks)
    .set({ isApproved: true })
    .where(and(eq(clerks.id, clerkId), eq(clerks.storeId, manager.storeId)));
  revalidatePath("/painel/balconistas");
}

export async function rejectClerk(clerkId: number): Promise<void> {
  const manager = await requireManager();
  await db
    .delete(clerks)
    .where(
      and(
        eq(clerks.id, clerkId),
        eq(clerks.storeId, manager.storeId),
        eq(clerks.isApproved, false),
        eq(clerks.isManager, false)
      )
    );
  revalidatePath("/painel/balconistas");
}

export async function updateClerkByManager(
  clerkId: number,
  _prev: ClerkUpdateFormState,
  formData: FormData
): Promise<ClerkUpdateFormState> {
  const manager = await requireManager();

  const [existing] = await db
    .select({ id: clerks.id })
    .from(clerks)
    .where(and(eq(clerks.id, clerkId), eq(clerks.storeId, manager.storeId)))
    .limit(1);
  if (!existing) {
    return { error: "Balconista não encontrado na sua loja." };
  }

  const parsed = clerkUpdateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    cpf: formData.get("cpf"),
    rg: formData.get("rg"),
    phone: formData.get("phone"),
    birthDate: formData.get("birthDate"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, cpf } = parsed.data;

  const [dup] = await db
    .select({ id: clerks.id })
    .from(clerks)
    .where(
      and(
        ne(clerks.id, clerkId),
        or(eq(clerks.email, email), eq(clerks.cpf, cpf))
      )
    )
    .limit(1);
  if (dup) {
    return {
      error:
        "Já existe outro balconista com esse email ou CPF. Verifique os dados.",
    };
  }

  await db
    .update(clerks)
    .set({
      name,
      email,
      cpf,
      rg: normalizeRg(parsed.data.rg),
      phone: normalizePhone(parsed.data.phone),
      birthDate: normalizeBirthDate(parsed.data.birthDate),
    })
    .where(eq(clerks.id, clerkId));

  revalidatePath("/painel/balconistas");
  redirect("/painel/balconistas");
}
