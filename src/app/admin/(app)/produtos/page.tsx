import Link from "next/link";
import { asc, count, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import {
  badgeNeutral,
  badgeSuccess,
  buttonSecondary,
  card,
  eyebrow,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import { NewProductForm } from "./new-product-form";
import { ProductActions } from "./product-actions";
import { Pagination, resolvePagination } from "@/app/_components/pagination";

export const metadata = { title: "Produtos — Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const [countRow] = await db.select({ count: count() }).from(products);
  const total = countRow.count;
  const { page, pageSize, offset } = resolvePagination(sp.page, total);

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      points: products.points,
      active: products.active,
    })
    .from(products)
    .orderBy(desc(products.active), asc(products.name))
    .limit(pageSize)
    .offset(offset);

  return (
    <div className="space-y-6">
      <div>
        <span className={eyebrow}>Catálogo Montana</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Produtos
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Cada produto Montana tem um valor em pontos.{" "}
          <span className="font-semibold text-[#A80000]">1 ponto = R$ 1,00</span> de cashback.
          Total: {total}.
        </p>
      </div>

      <NewProductForm />

      <div className={card}>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Produto</th>
                <th className={thClass}>Pontos</th>
                <th className={thClass}>Status</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={4}>
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={tdClass}>{r.name}</td>
                  <td className={tdClass}>{r.points}</td>
                  <td className={tdClass}>
                    {r.active ? (
                      <span className={badgeSuccess}>Ativo</span>
                    ) : (
                      <span className={badgeNeutral}>Inativo</span>
                    )}
                  </td>
                  <td className={tdClass}>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/produtos/${r.id}/editar`}
                        className={`${buttonSecondary} h-8 px-3 text-xs`}
                      >
                        Editar
                      </Link>
                      <ProductActions productId={r.id} isActive={r.active} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalItems={total} baseHref="/admin/produtos" />
      </div>
    </div>
  );
}
