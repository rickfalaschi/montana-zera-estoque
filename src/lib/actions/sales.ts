"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks, products, saleItems, sales } from "@/lib/db/schema";
import { requireManager } from "@/lib/dal";
import { saleSchema } from "@/lib/validators";

export type SaleFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

function parseSale(formData: FormData) {
  const clerkId = Number(formData.get("clerkId"));
  const productIds = formData.getAll("productId").map((v) => Number(v));
  const quantities = formData.getAll("quantity").map((v) => Number(v));
  const items = productIds
    .map((productId, i) => ({ productId, quantity: quantities[i] }))
    .filter((it) => it.productId && it.quantity);
  return saleSchema.safeParse({ clerkId, items });
}

async function assertEditableSale(saleId: number, storeId: number) {
  const [sale] = await db
    .select({
      id: sales.id,
      storeId: sales.storeId,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);
  if (!sale) return { ok: false as const, error: "Venda não encontrada." };
  if (sale.storeId !== storeId) {
    return { ok: false as const, error: "Essa venda não é da sua loja." };
  }
  const now = new Date();
  const created = sale.createdAt;
  const isCurrentMonth =
    now.getFullYear() === created.getFullYear() &&
    now.getMonth() === created.getMonth();
  if (!isCurrentMonth) {
    return {
      ok: false as const,
      error: "Vendas de meses anteriores não podem ser alteradas.",
    };
  }
  return { ok: true as const };
}

export async function createSale(
  _prev: SaleFormState,
  formData: FormData
): Promise<SaleFormState> {
  const manager = await requireManager();
  const parsed = parseSale(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { clerkId, items } = parsed.data;

  const [clerk] = await db
    .select({ id: clerks.id })
    .from(clerks)
    .where(
      and(
        eq(clerks.id, clerkId),
        eq(clerks.storeId, manager.storeId),
        eq(clerks.isApproved, true)
      )
    )
    .limit(1);
  if (!clerk) {
    return { error: "Balconista inválido." };
  }

  const productIds = items.map((i) => i.productId);
  const productRows = await db
    .select({ id: products.id, points: products.points })
    .from(products)
    .where(and(inArray(products.id, productIds), eq(products.active, true)));
  const productsById = new Map(productRows.map((p) => [p.id, p.points]));
  for (const it of items) {
    if (!productsById.has(it.productId)) {
      return { error: "Produto inválido ou inativo na venda." };
    }
  }

  const [inserted] = await db
    .insert(sales)
    .values({
      clerkId,
      storeId: manager.storeId,
      createdById: manager.id,
    })
    .returning({ id: sales.id });

  const itemsToInsert = items.map((it) => ({
    saleId: inserted.id,
    productId: it.productId,
    quantity: it.quantity,
    pointsEach: productsById.get(it.productId)!,
  }));
  await db.insert(saleItems).values(itemsToInsert);

  revalidatePath("/painel/vendas");
  revalidatePath("/painel");
  redirect("/painel/vendas");
}

export async function updateSale(
  saleId: number,
  _prev: SaleFormState,
  formData: FormData
): Promise<SaleFormState> {
  const manager = await requireManager();
  const check = await assertEditableSale(saleId, manager.storeId);
  if (!check.ok) return { error: check.error };

  const parsed = parseSale(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { clerkId, items } = parsed.data;

  const [clerk] = await db
    .select({ id: clerks.id })
    .from(clerks)
    .where(
      and(
        eq(clerks.id, clerkId),
        eq(clerks.storeId, manager.storeId),
        eq(clerks.isApproved, true)
      )
    )
    .limit(1);
  if (!clerk) return { error: "Balconista inválido." };

  const productIds = items.map((i) => i.productId);
  const productRows = await db
    .select({ id: products.id, points: products.points })
    .from(products)
    .where(and(inArray(products.id, productIds), eq(products.active, true)));
  const productsById = new Map(productRows.map((p) => [p.id, p.points]));
  for (const it of items) {
    if (!productsById.has(it.productId)) {
      return { error: "Produto inválido na venda." };
    }
  }

  await db.update(sales).set({ clerkId }).where(eq(sales.id, saleId));
  await db.delete(saleItems).where(eq(saleItems.saleId, saleId));

  const itemsToInsert = items.map((it) => ({
    saleId,
    productId: it.productId,
    quantity: it.quantity,
    pointsEach: productsById.get(it.productId)!,
  }));
  await db.insert(saleItems).values(itemsToInsert);

  revalidatePath("/painel/vendas");
  revalidatePath("/painel");
  redirect("/painel/vendas");
}

export async function deleteSale(saleId: number): Promise<void> {
  const manager = await requireManager();
  const check = await assertEditableSale(saleId, manager.storeId);
  if (!check.ok) {
    throw new Error(check.error);
  }
  await db.delete(sales).where(eq(sales.id, saleId));
  revalidatePath("/painel/vendas");
  revalidatePath("/painel");
}
