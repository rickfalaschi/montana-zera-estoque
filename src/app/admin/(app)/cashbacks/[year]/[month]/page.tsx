import Link from "next/link";
import { notFound } from "next/navigation";
import { getCashbacksForMonth } from "@/lib/cashback";
import {
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
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) notFound();

  const rows = await getCashbacksForMonth(y, m);
  if (rows.length === 0) notFound();

  const isClosed = rows[0]?.isClosed ?? false;
  const total = rows.reduce((acc, r) => acc + r.amountCents, 0);
  const paid = rows.filter((r) => r.isPaid).reduce((acc, r) => acc + r.amountCents, 0);
  const pending = total - paid;
  const paidCount = rows.filter((r) => r.isPaid).length;
  const pendingCount = rows.length - paidCount;

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
        <h2 className={sectionTitle}>Balconistas</h2>
        {!isClosed && (
          <p className="mt-1 text-sm text-zinc-500">
            Mês ainda em andamento — os valores podem mudar até o fechamento. Os
            botões de pagamento só ficam ativos depois do dia 1º do próximo mês.
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Balconista</th>
                <th className={thClass}>Loja</th>
                <th className={thClass}>Chave Pix</th>
                <th className={thClass}>Pontos</th>
                <th className={thClass}>Valor</th>
                <th className={thClass}>Status</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const vendasHref = `/admin/vendas?q=${encodeURIComponent(
                  `Balconista: ${r.clerkName} — ${formatCpf(r.clerkCpf)}`
                )}&month=${r.year}-${String(r.month).padStart(2, "0")}`;
                return (
                <tr key={r.clerkId} className={trClass}>
                  <td className={tdClass}>
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
                  <td className={tdClass}>{r.points}</td>
                  <td className={tdClass}>{formatBRL(r.amountCents)}</td>
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
