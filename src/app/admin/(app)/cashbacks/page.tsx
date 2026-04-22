import Link from "next/link";
import { getMonthlySummaries } from "@/lib/cashback";
import {
  badgeNeutral,
  badgeSuccess,
  badgeWarning,
  card,
  eyebrow,
  sectionTitle,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import { formatBRL, formatPeriod } from "@/lib/format";
import { Pagination, resolvePagination } from "@/app/_components/pagination";

export const metadata = { title: "Cashbacks — Admin" };

export default async function AdminCashbacksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;

  const summaries = await getMonthlySummaries();
  const closed = summaries.filter((s) => s.isClosed);
  const current = summaries.filter((s) => s.isCurrent);

  const { page, pageSize, offset } = resolvePagination(sp.page, closed.length);
  const closedPaged = closed.slice(offset, offset + pageSize);

  return (
    <div className="space-y-8">
      <div>
        <span className={eyebrow}>Pagamentos</span>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          Cashbacks
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Clique num mês fechado pra ver os balconistas elegíveis e marcar como pago.
        </p>
      </div>

      <section className={card}>
        <h2 className={sectionTitle}>Meses fechados</h2>
        <div className="mt-4 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Período</th>
                <th className={thClass}>Balconistas</th>
                <th className={thClass}>Total</th>
                <th className={thClass}>Pago</th>
                <th className={thClass}>Em aberto</th>
                <th className={thClass}>Status</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {closedPaged.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={7}>
                    Nenhum mês fechado com vendas.
                  </td>
                </tr>
              )}
              {closedPaged.map((s) => {
                const fullyPaid = s.pendingCount === 0;
                return (
                  <tr
                    key={`${s.year}-${s.month}`}
                    className={`${trClass} cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-zinc-900`}
                  >
                    <td className={tdClass}>
                      <Link
                        href={`/admin/cashbacks/${s.year}/${s.month}`}
                        className="block font-semibold text-zinc-900 hover:underline dark:text-white"
                      >
                        {formatPeriod(s.year, s.month)}
                      </Link>
                    </td>
                    <td className={tdClass}>{s.clerkCount}</td>
                    <td className={tdClass}>{formatBRL(s.totalCents)}</td>
                    <td className={tdClass}>
                      <span className="text-[#027D04]">{formatBRL(s.paidCents)}</span>
                    </td>
                    <td className={tdClass}>
                      <span className="text-[#A80000]">{formatBRL(s.pendingCents)}</span>
                    </td>
                    <td className={tdClass}>
                      {fullyPaid ? (
                        <span className={badgeSuccess}>Todos pagos</span>
                      ) : (
                        <span className={badgeWarning}>
                          {s.pendingCount} pendente{s.pendingCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </td>
                    <td className={tdClass}>
                      <Link
                        href={`/admin/cashbacks/${s.year}/${s.month}`}
                        className="text-sm font-semibold text-[#A80000] hover:underline"
                      >
                        Ver detalhes →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalItems={closed.length}
          baseHref="/admin/cashbacks"
        />
      </section>

      <section className={card}>
        <h2 className={sectionTitle}>Mês em andamento</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Valores parciais. Só ficam disponíveis pra pagamento depois do fechamento mensal.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Período</th>
                <th className={thClass}>Balconistas</th>
                <th className={thClass}>Pontos parciais</th>
                <th className={thClass}>Valor parcial</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {current.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={5}>
                    Nenhuma venda no mês corrente.
                  </td>
                </tr>
              )}
              {current.map((s) => (
                <tr key={`${s.year}-${s.month}`} className={trClass}>
                  <td className={tdClass}>{formatPeriod(s.year, s.month)}</td>
                  <td className={tdClass}>{s.clerkCount}</td>
                  <td className={tdClass}>{s.totalPoints}</td>
                  <td className={tdClass}>{formatBRL(s.totalCents)}</td>
                  <td className={tdClass}>
                    <Link
                      href={`/admin/cashbacks/${s.year}/${s.month}`}
                      className="text-sm font-semibold text-zinc-600 hover:text-[#A80000] hover:underline"
                    >
                      Ver prévia →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <span className={`${badgeNeutral} hidden`} aria-hidden />
    </div>
  );
}
