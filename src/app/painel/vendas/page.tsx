import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { requireManager } from "@/lib/dal";
import { db } from "@/lib/db";
import { clerks, saleItems, sales } from "@/lib/db/schema";
import {
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  card,
  eyebrow,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import { formatBRL, formatDateTime } from "@/lib/format";
import { DeleteSaleButton } from "./delete-sale-button";

export const metadata = { title: "Vendas da loja — Zera Estoque" };

export default async function ListSalesPage() {
  const manager = await requireManager();
  const rows = await db
    .select({
      id: sales.id,
      createdAt: sales.createdAt,
      clerkName: clerks.name,
      points: sql<number>`COALESCE(SUM(${saleItems.quantity} * ${saleItems.pointsEach}), 0)::float8`,
      items: sql<number>`COALESCE(SUM(${saleItems.quantity}), 0)::int`,
    })
    .from(sales)
    .innerJoin(clerks, eq(clerks.id, sales.clerkId))
    .leftJoin(saleItems, eq(saleItems.saleId, sales.id))
    .where(eq(sales.storeId, manager.storeId))
    .groupBy(sales.id, clerks.name)
    .orderBy(desc(sales.createdAt));

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Operação</span>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Vendas da loja
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="font-semibold">{manager.storeName}</span> — {rows.length} venda(s) registrada(s).
          </p>
        </div>
        <Link href="/painel/vendas/nova" className={buttonPrimary}>
          Nova venda
        </Link>
      </div>

      <div className={card}>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Data</th>
                <th className={thClass}>Balconista</th>
                <th className={thClass}>Itens</th>
                <th className={thClass}>Pontos</th>
                <th className={thClass}>Cashback</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={6}>
                    Nenhuma venda cadastrada ainda.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const d = r.createdAt;
                const editable = d.getFullYear() === curYear && d.getMonth() === curMonth;
                return (
                  <tr className={trClass} key={r.id}>
                    <td className={tdClass}>{formatDateTime(r.createdAt)}</td>
                    <td className={tdClass}>{r.clerkName}</td>
                    <td className={tdClass}>{r.items}</td>
                    <td className={tdClass}>{r.points}</td>
                    <td className={tdClass}>{formatBRL(r.points * 100)}</td>
                    <td className={tdClass}>
                      {editable ? (
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/painel/vendas/${r.id}/editar`}
                            className={`${buttonSecondary} h-8 px-3 text-xs`}
                          >
                            Editar
                          </Link>
                          <DeleteSaleButton saleId={r.id} />
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">Mês fechado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Vendas só podem ser editadas ou excluídas dentro do mês em que foram cadastradas.
      </p>

      <span className={`${buttonDanger} hidden`} aria-hidden />
    </div>
  );
}
