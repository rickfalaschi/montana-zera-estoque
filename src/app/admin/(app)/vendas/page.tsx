import Link from "next/link";
import { and, asc, count, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks, saleItems, sales, stores } from "@/lib/db/schema";
import {
  badgeBrand,
  buttonPrimary,
  buttonSecondary,
  card,
  eyebrow,
  inputClass,
  labelClass,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import {
  formatBRL,
  formatCnpj,
  formatCpf,
  formatDateTime,
  formatPeriod,
  onlyDigits,
} from "@/lib/format";
import { LinkRow } from "@/app/_components/link-row";
import { Pagination, resolvePagination } from "@/app/_components/pagination";

export const metadata = { title: "Vendas — Admin" };

export default async function AdminSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; month?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const monthQ = (sp.month ?? "").trim();
  const digits = onlyDigits(q);

  let storeId: number | null = null;
  let clerkId: number | null = null;
  let storeName: string | null = null;
  let clerkName: string | null = null;
  let notFoundFilter = false;

  if (q.length > 0) {
    if (digits.length === 14) {
      const [row] = await db
        .select({ id: stores.id, name: stores.name })
        .from(stores)
        .where(eq(stores.cnpj, digits))
        .limit(1);
      if (row) {
        storeId = row.id;
        storeName = row.name;
      } else {
        notFoundFilter = true;
      }
    } else if (digits.length === 11) {
      const [row] = await db
        .select({ id: clerks.id, name: clerks.name })
        .from(clerks)
        .where(eq(clerks.cpf, digits))
        .limit(1);
      if (row) {
        clerkId = row.id;
        clerkName = row.name;
      } else {
        notFoundFilter = true;
      }
    } else {
      notFoundFilter = true;
    }
  }

  let year: number | null = null;
  let month: number | null = null;
  if (/^\d{4}-\d{2}$/.test(monthQ)) {
    const [y, m] = monthQ.split("-").map(Number);
    if (y >= 2000 && m >= 1 && m <= 12) {
      year = y;
      month = m;
    }
  }

  const filters = and(
    storeId ? eq(sales.storeId, storeId) : undefined,
    clerkId ? eq(sales.clerkId, clerkId) : undefined,
    year ? sql`EXTRACT(YEAR FROM ${sales.createdAt})::int = ${year}` : undefined,
    month ? sql`EXTRACT(MONTH FROM ${sales.createdAt})::int = ${month}` : undefined
  );

  const [allStores, allClerks, availableMonths, countResult] = await Promise.all([
    db
      .select({ id: stores.id, name: stores.name, cnpj: stores.cnpj })
      .from(stores)
      .orderBy(asc(stores.name)),
    db
      .select({ id: clerks.id, name: clerks.name, cpf: clerks.cpf })
      .from(clerks)
      .orderBy(asc(clerks.name)),
    db
      .selectDistinct({
        year: sql<number>`EXTRACT(YEAR FROM ${sales.createdAt})::int`,
        month: sql<number>`EXTRACT(MONTH FROM ${sales.createdAt})::int`,
      })
      .from(sales)
      .orderBy(
        desc(sql`EXTRACT(YEAR FROM ${sales.createdAt})::int`),
        desc(sql`EXTRACT(MONTH FROM ${sales.createdAt})::int`)
      ),
    db.select({ count: count() }).from(sales).where(filters),
  ]);

  const total = countResult[0]?.count ?? 0;
  const { page, pageSize, offset } = resolvePagination(sp.page, total);

  const rows = await db
    .select({
      id: sales.id,
      createdAt: sales.createdAt,
      clerkId: sales.clerkId,
      storeId: sales.storeId,
      clerkName: clerks.name,
      storeName: stores.name,
      points: sql<number>`COALESCE(SUM(${saleItems.quantity} * ${saleItems.pointsEach}), 0)::int`,
      items: sql<number>`COALESCE(SUM(${saleItems.quantity}), 0)::int`,
    })
    .from(sales)
    .innerJoin(clerks, eq(clerks.id, sales.clerkId))
    .innerJoin(stores, eq(stores.id, sales.storeId))
    .leftJoin(saleItems, eq(saleItems.saleId, sales.id))
    .where(filters)
    .groupBy(sales.id, clerks.name, stores.name)
    .orderBy(desc(sales.createdAt))
    .limit(pageSize)
    .offset(offset);

  const hasFilters = q.length > 0 || monthQ.length > 0;
  void or;

  return (
    <div className="space-y-6">
      <div>
        <span className={eyebrow}>Transações</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Vendas
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {total}{" "}
          {total === 1 ? "venda encontrada" : "vendas encontradas"}. Clique em
          uma venda para ver os itens.
        </p>
      </div>

      <form
        method="get"
        className={`${card} grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_auto]`}
      >
        <div>
          <label className={labelClass} htmlFor="q">
            Loja ou balconista
          </label>
          <input
            id="q"
            name="q"
            list="filter-datalist"
            defaultValue={q}
            placeholder="Selecione ou digite CNPJ (14) ou CPF (11)"
            className={inputClass}
            autoComplete="off"
          />
          <datalist id="filter-datalist">
            {allStores.map((s) => (
              <option
                key={`store-${s.id}`}
                value={`Loja: ${s.name} — ${formatCnpj(s.cnpj)}`}
              />
            ))}
            {allClerks.map((c) => (
              <option
                key={`clerk-${c.id}`}
                value={`Balconista: ${c.name} — ${formatCpf(c.cpf)}`}
              />
            ))}
          </datalist>
          {notFoundFilter && (
            <p className="mt-1 text-xs text-red-600">
              Nenhuma loja com esse CNPJ nem balconista com esse CPF. Selecione
              uma opção da lista ou informe 14 dígitos (CNPJ) ou 11 dígitos (CPF).
            </p>
          )}
          {storeName && (
            <p className="mt-1 text-xs text-[#015701]">
              Filtrando pela loja <strong>{storeName}</strong>.
            </p>
          )}
          {clerkName && (
            <p className="mt-1 text-xs text-[#015701]">
              Filtrando pelo balconista <strong>{clerkName}</strong>.
            </p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="month">
            Mês
          </label>
          <select
            id="month"
            name="month"
            defaultValue={monthQ}
            className={inputClass}
          >
            <option value="">Todos os meses</option>
            {availableMonths.map((m) => {
              const val = `${m.year}-${String(m.month).padStart(2, "0")}`;
              return (
                <option key={val} value={val}>
                  {formatPeriod(m.year, m.month)}
                </option>
              );
            })}
          </select>
          {year && month && (
            <p className="mt-1 text-xs text-[#015701]">
              Filtrando por <strong>{formatPeriod(year, month)}</strong>.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span aria-hidden className={`${labelClass} invisible`}>
            &nbsp;
          </span>
          <div className="flex gap-2">
            <button type="submit" className={`${buttonPrimary} flex-1`}>
              Filtrar
            </button>
            {hasFilters && (
              <Link href="/admin/vendas" className={buttonSecondary}>
                Limpar
              </Link>
            )}
          </div>
        </div>
      </form>

      {hasFilters && rows.length === 0 && (
        <div className={`${card} text-center`}>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Nenhuma venda encontrada para os filtros selecionados.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className={card}>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr className={trClass}>
                  <th className={thClass}>Data</th>
                  <th className={thClass}>Loja</th>
                  <th className={thClass}>Balconista</th>
                  <th className={thClass}>Itens</th>
                  <th className={thClass}>Pontos</th>
                  <th className={thClass}>Cashback</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <LinkRow
                    key={r.id}
                    href={`/admin/vendas/${r.id}`}
                    className={trClass}
                    ariaLabel={`Ver detalhes da venda de ${r.clerkName} em ${formatDateTime(r.createdAt)}`}
                  >
                    <td className={tdClass}>{formatDateTime(r.createdAt)}</td>
                    <td className={tdClass}>{r.storeName}</td>
                    <td className={tdClass}>{r.clerkName}</td>
                    <td className={tdClass}>{r.items}</td>
                    <td className={tdClass}>{r.points}</td>
                    <td className={tdClass}>{formatBRL(r.points * 100)}</td>
                    <td className={`${tdClass} text-right font-bold text-[#A80000]`}>→</td>
                  </LinkRow>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalItems={total}
            baseHref="/admin/vendas"
            params={{ q, month: monthQ }}
          />
        </div>
      )}

      <span className={`${badgeBrand} hidden`} aria-hidden />
    </div>
  );
}
