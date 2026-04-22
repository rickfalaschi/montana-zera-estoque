import Link from "next/link";
import { notFound } from "next/navigation";
import { getCashbacksForMonth } from "@/lib/cashback";
import {
  badgeBrand,
  badgeSuccess,
  badgeWarning,
  buttonSecondary,
  card,
  eyebrow,
  sectionTitle,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import { formatBRL, formatCpf, formatDateTime, formatPeriod } from "@/lib/format";
import { CashbackAction } from "../../cashback-action";

export const metadata = { title: "Cashback do mês — Admin" };

export default async function MonthDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ year: string; month: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { year, month } = await params;
  const sp = await searchParams;
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) notFound();

  const allRows = await getCashbacksForMonth(y, m);
  if (allRows.length === 0) notFound();

  const isClosed = allRows[0]?.isClosed ?? false;
  const total = allRows.reduce((acc, r) => acc + r.amountCents, 0);
  const paid = allRows.filter((r) => r.isPaid).reduce((acc, r) => acc + r.amountCents, 0);
  const pending = total - paid;
  const paidCount = allRows.filter((r) => r.isPaid).length;
  const pendingCount = allRows.length - paidCount;

  const filter = sp.status === "pending" || sp.status === "paid" ? sp.status : "all";
  const rows =
    filter === "pending"
      ? allRows.filter((r) => !r.isPaid)
      : filter === "paid"
        ? allRows.filter((r) => r.isPaid)
        : allRows;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>
            {isClosed ? "Mês fechado" : "Mês em andamento"}
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            {formatPeriod(y, m)}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {rows.length} balconista{rows.length === 1 ? "" : "s"} com cashback
            neste período.
          </p>
        </div>
        <Link href="/admin/cashbacks" className={buttonSecondary}>
          ← Voltar
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Total do mês
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {formatBRL(total)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{rows.length} balconistas</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#015701]">
            Pago
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-[#027D04]">
            {formatBRL(paid)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{paidCount} pagamentos</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A80000]">
            Em aberto
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-[#A80000]">
            {formatBRL(pending)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{pendingCount} pendentes</p>
        </div>
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={sectionTitle}>Balconistas</h2>
            {!isClosed && (
              <p className="mt-1 text-sm text-zinc-500">
                Mês ainda em andamento — os valores podem mudar até o fechamento.
                Os botões de pagamento só ficam ativos depois do dia 1º do próximo
                mês.
              </p>
            )}
            {isClosed && (
              <p className="mt-1 text-sm text-zinc-500">
                Mostrando {rows.length} de {allRows.length} balconista
                {allRows.length === 1 ? "" : "s"}.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav
              aria-label="Filtrar por status"
              className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800"
            >
              {(
                [
                  { key: "all", label: `Todos (${allRows.length})` },
                  { key: "pending", label: `Pendentes (${pendingCount})` },
                  { key: "paid", label: `Pagos (${paidCount})` },
                ] as const
              ).map((opt) => {
                const active = filter === opt.key;
                const href =
                  opt.key === "all"
                    ? `/admin/cashbacks/${y}/${m}`
                    : `/admin/cashbacks/${y}/${m}?status=${opt.key}`;
                return (
                  <Link
                    key={opt.key}
                    href={href}
                    className={
                      active
                        ? "rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                        : "rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    }
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </nav>
            <a
              href={`/admin/cashbacks/${y}/${m}/export${filter !== "all" ? `?status=${filter}` : ""}`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#027D04] px-3 text-xs font-semibold text-white transition hover:bg-[#015701]"
              title="Baixar lista filtrada em CSV (abre no Excel)"
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar
            </a>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Balconista</th>
                <th className={thClass}>Loja</th>
                <th className={thClass}>Chave Pix</th>
                <th className={thClass}>Pontos próprios</th>
                <th className={thClass}>Bônus gerente</th>
                <th className={thClass}>Valor total</th>
                <th className={thClass}>Status</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={8}>
                    Nenhum balconista {filter === "pending" ? "pendente" : "pago"} neste período.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const vendasHref = `/admin/vendas?q=${encodeURIComponent(
                  `Balconista: ${r.clerkName} — ${formatCpf(r.clerkCpf)}`
                )}&month=${r.year}-${String(r.month).padStart(2, "0")}`;
                return (
                <tr key={r.clerkId} className={trClass}>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2">
                      <Link
                        href={vendasHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-zinc-900 hover:text-[#A80000] hover:underline dark:text-white"
                        title={`Abrir vendas de ${r.clerkName} em ${formatPeriod(r.year, r.month)} em nova aba`}
                      >
                        {r.clerkName}
                        <span className="ml-1 text-xs text-zinc-400">↗</span>
                      </Link>
                      {r.isManager && <span className={badgeBrand}>Gerente</span>}
                    </div>
                  </td>
                  <td className={tdClass}>{r.storeName}</td>
                  <td className={tdClass}>
                    {r.clerkPixKey ? (
                      <span className="font-mono text-xs">{r.clerkPixKey}</span>
                    ) : (
                      <span className="text-xs italic text-red-600">
                        sem chave cadastrada
                      </span>
                    )}
                  </td>
                  <td className={tdClass}>
                    {r.points}
                    <span className="block text-xs text-zinc-500">
                      {formatBRL(r.ownCents)}
                    </span>
                  </td>
                  <td className={tdClass}>
                    {r.isManager ? (
                      r.teamPoints > 0 ? (
                        <>
                          <span className="font-semibold">
                            {formatBRL(r.bonusCents)}
                          </span>
                          <span className="block text-xs text-zinc-500">
                            5% de {r.teamPoints} pts da equipe
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-400">sem equipe no mês</span>
                      )
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className={`${tdClass} font-bold`}>{formatBRL(r.amountCents)}</td>
                  <td className={tdClass}>
                    {r.isPaid ? (
                      <span className={badgeSuccess}>
                        Pago{r.paidAt ? ` em ${formatDateTime(r.paidAt)}` : ""}
                      </span>
                    ) : isClosed ? (
                      <span className={badgeWarning}>Aguardando pagamento</span>
                    ) : (
                      <span className="text-xs text-zinc-500">—</span>
                    )}
                  </td>
                  <td className={tdClass}>
                    {isClosed ? (
                      <CashbackAction
                        clerkId={r.clerkId}
                        year={r.year}
                        month={r.month}
                        amountCents={r.amountCents}
                        isPaid={r.isPaid}
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
