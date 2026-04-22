import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { requireManager } from "@/lib/dal";
import { db } from "@/lib/db";
import { clerks, products } from "@/lib/db/schema";
import { SaleForm } from "../sale-form";
import { buttonSecondary, eyebrow } from "@/lib/ui";

export const metadata = { title: "Nova venda — Zera Estoque" };

export default async function NewSalePage() {
  const manager = await requireManager();

  const [clerksList, productsList] = await Promise.all([
    db
      .select({ id: clerks.id, name: clerks.name })
      .from(clerks)
      .where(and(eq(clerks.storeId, manager.storeId), eq(clerks.isApproved, true)))
      .orderBy(asc(clerks.name)),
    db
      .select({
        id: products.id,
        name: products.name,
        points: products.points,
      })
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.name)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Nova operação</span>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Nova venda
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Cadastre a venda em nome do balconista que a realizou.
          </p>
        </div>
        <Link href="/painel/vendas" className={buttonSecondary}>
          Cancelar
        </Link>
      </div>
      <SaleForm mode="create" clerks={clerksList} products={productsList} />
    </div>
  );
}
