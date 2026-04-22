import Link from "next/link";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks, stores } from "@/lib/db/schema";
import {
  badgeDanger,
  buttonPrimary,
  buttonSecondary,
  card,
  eyebrow,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import { formatCnpj, formatDate } from "@/lib/format";
import { DeleteStoreButton } from "./delete-store-button";
import { Pagination, resolvePagination } from "@/app/_components/pagination";

export const metadata = { title: "Lojas — Admin" };

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const [countRow] = await db.select({ count: count() }).from(stores);
  const totalStores = countRow.count;
  const { page, pageSize, offset } = resolvePagination(sp.page, totalStores);

  const rows = await db
    .select({
      id: stores.id,
      name: stores.name,
      cnpj: stores.cnpj,
      createdAt: stores.createdAt,
      clerksCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${clerks}
        WHERE ${clerks.storeId} = ${stores.id}
      )`,
      manager: sql<string | null>`(
        SELECT ${clerks.name} FROM ${clerks}
        WHERE ${clerks.storeId} = ${stores.id} AND ${clerks.isManager} = TRUE
        LIMIT 1
      )`,
      managerEmail: sql<string | null>`(
        SELECT ${clerks.email} FROM ${clerks}
        WHERE ${clerks.storeId} = ${stores.id} AND ${clerks.isManager} = TRUE
        LIMIT 1
      )`,
    })
    .from(stores)
    .orderBy(desc(stores.createdAt))
    .limit(pageSize)
    .offset(offset);
  // and/eq importados para manter o compilador feliz em futuras queries
  void and;
  void eq;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Rede</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Lojas
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {totalStores} loja(s) cadastrada(s).
          </p>
        </div>
        <Link href="/admin/lojas/nova" className={buttonPrimary}>
          Nova loja
        </Link>
      </div>
      <div className={card}>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Nome</th>
                <th className={thClass}>CNPJ</th>
                <th className={thClass}>Gerente</th>
                <th className={thClass}>Balconistas</th>
                <th className={thClass}>Cadastro</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={6}>
                    Nenhuma loja cadastrada.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={tdClass}>
                    <Link
                      href={`/admin/lojas/${r.id}`}
                      className="font-semibold text-zinc-900 hover:text-[#A80000] hover:underline dark:text-white"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className={tdClass}>{formatCnpj(r.cnpj)}</td>
                  <td className={tdClass}>
                    {r.manager ? (
                      <div>
                        <p>{r.manager}</p>
                        <p className="text-xs text-zinc-500">{r.managerEmail}</p>
                      </div>
                    ) : (
                      <span className={badgeDanger}>Sem gerente</span>
                    )}
                  </td>
                  <td className={tdClass}>{r.clerksCount}</td>
                  <td className={tdClass}>{formatDate(r.createdAt)}</td>
                  <td className={tdClass}>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/lojas/${r.id}`}
                        className={`${buttonSecondary} h-8 px-3 text-xs`}
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/lojas/${r.id}/editar`}
                        className={`${buttonSecondary} h-8 px-3 text-xs`}
                      >
                        Editar
                      </Link>
                      <DeleteStoreButton storeId={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalItems={totalStores} baseHref="/admin/lojas" />
      </div>
    </div>
  );
}
