"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks } from "@/lib/db/schema";
import { requireClerk } from "@/lib/dal";
import { profileUpdateSchema } from "@/lib/validators";

export type ProfileFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: boolean;
} | null;

export async function updateClerkProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const clerk = await requireClerk();
  const parsed = profileUpdateSchema.safeParse({
    pixKey: formData.get("pixKey"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const raw = parsed.data.pixKey?.trim();
  const pixKey = raw && raw.length > 0 ? raw : null;
  await db.update(clerks).set({ pixKey }).where(eq(clerks.id, clerk.id));
  revalidatePath("/painel/perfil");
  revalidatePath("/painel");
  return { success: true };
}
