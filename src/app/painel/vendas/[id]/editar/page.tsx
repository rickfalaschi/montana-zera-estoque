import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { requireManager } from "@/lib/dal";
import { db } from "@/lib/db";
import { clerks, products, saleItems, sales } from "@/lib/db/schema";
import { SaleForm } from "../../sale-form";
import { buttonSecondary, eyebrow } from "@/lib/ui";

export const metadata = { title: "Editar venda — Zera Estoque" };

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const manager = await requireManager();
  const { id } = await params;
  const saleId = Number(id);
  if (!Number.isFinite(saleId)) notFound();

  const [sale] = await db
    .select({
      id: sales.id,
      clerkId: sales.clerkId,
      storeId: sales.storeId,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);
  if (!sale) notFound();
  if (sale.storeId !== manager.storeId) redirect("/painel/vendas");
  const created = sale.createdAt;
  const now = new Date();
  const editable =
    created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  if (!editable) redirect("/painel/vendas");

  const [items, clerksList, productsList] = await Promise.all([
    db
      .select({ productId: saleItems.productId, quantity: saleItems.quantity })
      .from(saleItems)
      .where(eq(saleItems.saleId, saleId)),
    db
      .select({ id: clerks.id, name: clerks.name })
      .from(clerks)
      .where(and(eq(clerks.storeId, manager.storeId), eq(clerks.isApproved, true)))
      .orderBy(asc(clerks.name)),
    db
      .select({ id: products.id, name: products.name, points: products.points })
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.name)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Edição</span>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Editar venda
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Venda cadastrada em {created.toLocaleDateString("pt-BR")}.
          </p>
        </div>
        <Link href="/painel/vendas" className={buttonSecondary}>
          Cancelar
        </Link>
      </div>
      <SaleForm
        mode="edit"
        saleId={saleId}
        clerks={clerksList}
        products={productsList}
        initial={{
          clerkId: sale.clerkId,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }}
      />
    </div>
  );
}
