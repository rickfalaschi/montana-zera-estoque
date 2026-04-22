"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks } from "@/lib/db/schema";
import { requireManager } from "@/lib/dal";
import { clerkUpdateSchema } from "@/lib/validators";

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
    .set({ name, email, cpf })
    .where(eq(clerks.id, clerkId));

  revalidatePath("/painel/balconistas");
  redirect("/painel/balconistas");
}
