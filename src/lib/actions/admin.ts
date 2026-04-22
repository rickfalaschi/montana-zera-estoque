"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, count, eq, ne, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  administrators,
  cashbackPayments,
  clerks,
  products,
  sales,
  stores,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/dal";
import { onlyDigits } from "@/lib/format";
import {
  adminCreateSchema,
  clerkUpdateSchema,
  productSchema,
  profileUpdateSchema,
  storeCreateSchema,
  storeUpdateSchema,
} from "@/lib/validators";

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

function normalizeText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function normalizeUf(value: string | undefined): string | null {
  const trimmed = value?.trim().toUpperCase();
  if (!trimmed || !/^[A-Z]{2}$/.test(trimmed)) return null;
  return trimmed;
}

function normalizeCep(value: string | undefined): string | null {
  if (!value) return null;
  const digits = onlyDigits(value);
  return digits.length === 8 ? digits : null;
}

export type AdminFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

// Lojas ------------------------------------------------------------------

export async function createStoreWithManager(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = storeCreateSchema.safeParse({
    name: formData.get("name"),
    legalName: formData.get("legalName"),
    cnpj: formData.get("cnpj"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipcode: formData.get("zipcode"),
    phone: formData.get("phone"),
    managerName: formData.get("managerName"),
    managerEmail: formData.get("managerEmail"),
    managerCpf: formData.get("managerCpf"),
    managerPassword: formData.get("managerPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const [existingStore] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.cnpj, data.cnpj))
    .limit(1);
  if (existingStore) {
    return { error: "Já existe loja cadastrada com esse CNPJ." };
  }
  const [existingClerk] = await db
    .select({ id: clerks.id })
    .from(clerks)
    .where(
      or(eq(clerks.email, data.managerEmail), eq(clerks.cpf, data.managerCpf))
    )
    .limit(1);
  if (existingClerk) {
    return { error: "Já existe balconista com esse email ou CPF." };
  }

  const hash = await bcrypt.hash(data.managerPassword, 10);
  const [store] = await db
    .insert(stores)
    .values({
      name: data.name,
      legalName: data.legalName,
      cnpj: data.cnpj,
      address: data.address,
      city: data.city,
      state: data.state,
      zipcode: data.zipcode,
      phone: data.phone,
    })
    .returning({ id: stores.id });

  await db.insert(clerks).values({
    name: data.managerName,
    email: data.managerEmail,
    cpf: data.managerCpf,
    passwordHash: hash,
    storeId: store.id,
    isManager: true,
    isApproved: true,
  });

  revalidatePath("/admin/lojas");
  redirect("/admin/lojas");
}

export async function updateStore(
  storeId: number,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = storeUpdateSchema.safeParse({
    name: formData.get("name"),
    cnpj: formData.get("cnpj"),
    legalName: formData.get("legalName"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipcode: formData.get("zipcode"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const [dup] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(and(eq(stores.cnpj, parsed.data.cnpj), ne(stores.id, storeId)))
    .limit(1);
  if (dup) {
    return { error: "Já existe outra loja cadastrada com esse CNPJ." };
  }
  await db
    .update(stores)
    .set({
      name: parsed.data.name,
      cnpj: parsed.data.cnpj,
      legalName: normalizeText(parsed.data.legalName),
      address: normalizeText(parsed.data.address),
      city: normalizeText(parsed.data.city),
      state: normalizeUf(parsed.data.state),
      zipcode: normalizeCep(parsed.data.zipcode),
      phone: normalizePhone(parsed.data.phone),
    })
    .where(eq(stores.id, storeId));
  revalidatePath("/admin/lojas");
  redirect("/admin/lojas");
}

export async function deleteStore(
  storeId: number
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await db.delete(stores).where(eq(stores.id, storeId));
  } catch (err) {
    console.error("deleteStore failed:", err);
    return {
      error:
        "Não foi possível excluir a loja. Verifique se todas as vendas foram excluídas antes.",
    };
  }
  revalidatePath("/admin/lojas");
  return {};
}

// Produtos ---------------------------------------------------------------

export async function createProduct(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    points: formData.get("points"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.insert(products).values({
    name: parsed.data.name,
    points: parsed.data.points,
  });
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function updateProduct(
  productId: number,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    points: formData.get("points"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db
    .update(products)
    .set({ name: parsed.data.name, points: parsed.data.points })
    .where(eq(products.id, productId));
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function toggleProductActive(productId: number): Promise<void> {
  await requireAdmin();
  await db
    .update(products)
    .set({ active: sql`NOT ${products.active}` })
    .where(eq(products.id, productId));
  revalidatePath("/admin/produtos");
}

// Cashbacks --------------------------------------------------------------

export async function markCashbackPaid(
  clerkId: number,
  year: number,
  month: number,
  amountCents: number
): Promise<void> {
  await requireAdmin();
  await db
    .insert(cashbackPayments)
    .values({ clerkId, periodYear: year, periodMonth: month, amountCents })
    .onConflictDoUpdate({
      target: [
        cashbackPayments.clerkId,
        cashbackPayments.periodYear,
        cashbackPayments.periodMonth,
      ],
      set: { amountCents, paidAt: new Date() },
    });
  revalidatePath("/admin/cashbacks");
}

export async function unmarkCashbackPaid(
  clerkId: number,
  year: number,
  month: number
): Promise<void> {
  await requireAdmin();
  await db
    .delete(cashbackPayments)
    .where(
      and(
        eq(cashbackPayments.clerkId, clerkId),
        eq(cashbackPayments.periodYear, year),
        eq(cashbackPayments.periodMonth, month)
      )
    );
  revalidatePath("/admin/cashbacks");
}

// Balconistas ------------------------------------------------------------

export async function adminDeleteClerk(
  clerkId: number
): Promise<{ error?: string }> {
  await requireAdmin();

  const [clerk] = await db
    .select({
      id: clerks.id,
      isManager: clerks.isManager,
      storeId: clerks.storeId,
    })
    .from(clerks)
    .where(eq(clerks.id, clerkId))
    .limit(1);
  if (!clerk) return { error: "Balconista não encontrado." };

  const [salesCreated] = await db
    .select({ count: count() })
    .from(sales)
    .where(eq(sales.createdById, clerkId));

  const [managersInStore] = await db
    .select({ count: count() })
    .from(clerks)
    .where(
      and(eq(clerks.storeId, clerk.storeId), eq(clerks.isManager, true))
    );

  if (clerk.isManager && managersInStore.count <= 1) {
    return {
      error:
        "Não é possível excluir: este é o único gerente da loja. Promova outro balconista a gerente antes.",
    };
  }
  if (salesCreated.count > 0) {
    return {
      error: `Não é possível excluir: este balconista registrou ${salesCreated.count} venda(s) como gerente. Transfira ou desative antes de excluir.`,
    };
  }

  await db.delete(clerks).where(eq(clerks.id, clerkId));
  revalidatePath("/admin/balconistas");
  return {};
}

export async function adminApproveClerk(clerkId: number): Promise<void> {
  await requireAdmin();
  await db
    .update(clerks)
    .set({ isApproved: true })
    .where(eq(clerks.id, clerkId));
  revalidatePath("/admin/balconistas");
}

export async function adminUpdateClerk(
  clerkId: number,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const [clerk] = await db
    .select({
      id: clerks.id,
      isManager: clerks.isManager,
      storeId: clerks.storeId,
    })
    .from(clerks)
    .where(eq(clerks.id, clerkId))
    .limit(1);
  if (!clerk) return { error: "Balconista não encontrado." };

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
  const pixParsed = profileUpdateSchema.safeParse({
    pixKey: formData.get("pixKey"),
  });
  if (!pixParsed.success) {
    return { fieldErrors: pixParsed.error.flatten().fieldErrors };
  }

  const wantsManager = formData.get("isManager") === "on";
  const wantsApproved = formData.get("isApproved") === "on";

  if (clerk.isManager && !wantsManager) {
    const [managers] = await db
      .select({ count: count() })
      .from(clerks)
      .where(
        and(eq(clerks.storeId, clerk.storeId), eq(clerks.isManager, true))
      );
    if (managers.count <= 1) {
      return {
        error:
          "Não é possível rebaixar: este é o único gerente da loja. Promova outro balconista a gerente antes.",
      };
    }
  }

  // Cada loja só pode ter 1 gerente — se está promovendo, checar se já existe outro.
  if (!clerk.isManager && wantsManager) {
    const [existingManager] = await db
      .select({ id: clerks.id, name: clerks.name })
      .from(clerks)
      .where(
        and(
          eq(clerks.storeId, clerk.storeId),
          eq(clerks.isManager, true),
          ne(clerks.id, clerkId)
        )
      )
      .limit(1);
    if (existingManager) {
      return {
        error: `Já existe um gerente na loja (${existingManager.name}). Rebaixe o gerente atual antes de promover outro.`,
      };
    }
  }

  const [dup] = await db
    .select({ id: clerks.id })
    .from(clerks)
    .where(
      and(
        ne(clerks.id, clerkId),
        or(
          eq(clerks.email, parsed.data.email),
          eq(clerks.cpf, parsed.data.cpf)
        )
      )
    )
    .limit(1);
  if (dup) {
    return { error: "Já existe outro balconista com esse email ou CPF." };
  }

  const pixRaw = pixParsed.data.pixKey?.trim();
  const pixKey = pixRaw && pixRaw.length > 0 ? pixRaw : null;

  await db
    .update(clerks)
    .set({
      name: parsed.data.name,
      email: parsed.data.email,
      cpf: parsed.data.cpf,
      rg: normalizeRg(parsed.data.rg),
      phone: normalizePhone(parsed.data.phone),
      birthDate: normalizeBirthDate(parsed.data.birthDate),
      pixKey,
      isManager: wantsManager,
      isApproved: wantsApproved,
    })
    .where(eq(clerks.id, clerkId));

  revalidatePath("/admin/balconistas");
  redirect("/admin/balconistas");
}

// Administradores --------------------------------------------------------

export async function createAdmin(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = adminCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: administrators.id })
    .from(administrators)
    .where(eq(administrators.email, email))
    .limit(1);
  if (existing) {
    return { error: "Já existe um admin com esse email." };
  }

  const hash = await bcrypt.hash(password, 10);
  await db.insert(administrators).values({
    name,
    email,
    passwordHash: hash,
  });

  revalidatePath("/admin/admins");
  redirect("/admin/admins");
}

export async function deleteAdmin(
  adminId: number
): Promise<{ error?: string }> {
  const current = await requireAdmin();
  if (current.id === adminId) {
    return { error: "Você não pode excluir sua própria conta." };
  }
  const [countRow] = await db.select({ count: count() }).from(administrators);
  if (countRow.count <= 1) {
    return {
      error:
        "Não é possível excluir o último admin — a plataforma precisa de ao menos um.",
    };
  }
  await db.delete(administrators).where(eq(administrators.id, adminId));
  revalidatePath("/admin/admins");
  return {};
}
