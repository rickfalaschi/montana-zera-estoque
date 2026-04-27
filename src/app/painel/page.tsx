import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { requireClerk } from "@/lib/dal";
import { db } from "@/lib/db";
import { saleItems, sales } from "@/lib/db/schema";
import { getClerkCashbacks } from "@/lib/cashback";
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
import { formatBRL, formatDateTime, formatPeriod } from "@/lib/format";

async function getRecentSales(clerkId: number) {
  return db
    .select({
      id: sales.id,
      createdAt: sales.createdAt,
      points: sql<number>`COALESCE(SUM(${saleItems.quantity} * ${saleItems.pointsEach}), 0)::float8`,
      items: sql<number>`COALESCE(SUM(${saleItems.quantity}), 0)::int`,
    })
    .from(sales)
    .leftJoin(saleItems, eq(saleItems.saleId, sales.id))
    .where(eq(sales.clerkId, clerkId))
    .groupBy(sales.id)
    .orderBy(desc(sales.createdAt))
    .limit(50);
}

export const metadata = { title: "Meu painel — Zera Estoque" };

export default async function PainelPage() {
  const clerk = await requireClerk();
  const [salesList, cashbacks] = await Promise.all([
    getRecentSales(clerk.id),
    getClerkCashbacks(clerk.id),
  ]);
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const currentMonth = cashbacks.find((c) => c.year === curYear && c.month === curMonth);
  const pastClosed = cashbacks.filter((c) => c.isClosed);
  const totalPendingCents = pastClosed
    .filter((c) => !c.isPaid)
    .reduce((acc, c) => acc + c.amountCents, 0);
  const totalPaidCents = pastClosed
    .filter((c) => c.isPaid)
    .reduce((acc, c) => acc + c.amountCents, 0);

  return (
    <div className="space-y-10">
      <div>
        <span className={eyebrow}>Campanha Zera Estoque</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Olá, {clerk.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Resumo das suas vendas na{" "}
          <span className="font-semibold text-zinc-900 dark:text-white">
            {clerk.storeName}
          </span>
          .
        </p>
      </div>

      {!clerk.pixKey && (
        <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-[#FFBE00]/25 to-[#FFBE00]/10 p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-zinc-800 dark:text-zinc-100">
            <p className="font-semibold">Cadastre sua chave Pix para receber o cashback.</p>
            <p className="text-zinc-600 dark:text-zinc-300">
              Sem chave cadastrada, a Montana não consegue te pagar quando o mês fechar.
            </p>
          </div>
          <Link
            href="/painel/perfil"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#A80000] px-4 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#7a0000]"
          >
            Cadastrar Pix
          </Link>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#A80000] via-[#8a0000] to-[#5a0000] p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Mês atual · {formatPeriod(curYear, curMonth)}
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight">
            {formatBRL(currentMonth?.amountCents ?? 0)}
          </p>
          {clerk.isManager && (currentMonth?.bonusCents ?? 0) > 0 ? (
            <p className="mt-2 text-xs text-white/85">
              {formatBRL(currentMonth?.ownCents ?? 0)} das suas vendas +{" "}
              {formatBRL(currentMonth?.bonusCents ?? 0)} de bônus gerente (5% de{" "}
              {currentMonth?.teamPoints ?? 0} pts da equipe).
            </p>
          ) : (
            <p className="mt-2 text-xs text-white/75">
              {currentMonth?.points ?? 0} pontos acumulados. Fecha no dia 1º do próximo
              mês.
            </p>
          )}
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Aguardando pagamento
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[#A80000]">
            {formatBRL(totalPendingCents)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Meses fechados ainda não pagos.</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Já recebido
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[#027D04]">
            {formatBRL(totalPaidCents)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Soma de todos os cashbacks pagos.</p>
        </div>
      </section>

      <section className={card}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className={sectionTitle}>Cashback por mês</h2>
            <p className="mt-1 text-sm text-zinc-500">
              O valor de cada mês fica disponível no primeiro dia do mês seguinte.
              {clerk.isManager && (
                <>
                  {" "}Como gerente, você recebe <strong>5% de bônus</strong> sobre
                  o cashback da equipe da sua loja.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Período</th>
                <th className={thClass}>Pontos próprios</th>
                {clerk.isManager && <th className={thClass}>Bônus gerente</th>}
                <th className={thClass}>Valor total</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {cashbacks.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={clerk.isManager ? 5 : 4}>
                    Ainda não há vendas registradas.
                  </td>
                </tr>
              )}
              {cashbacks.map((c) => {
                let status: React.ReactNode;
                if (!c.isClosed) {
                  status = <span className={badgeNeutral}>Mês em andamento</span>;
                } else if (c.isPaid) {
                  status = (
                    <span className={badgeSuccess}>
                      Pagamento realizado
                      {c.paidAt ? ` em ${formatDateTime(c.paidAt)}` : ""}
                    </span>
                  );
                } else {
                  status = <span className={badgeWarning}>Aguardando pagamento</span>;
                }
                return (
                  <tr className={trClass} key={`${c.year}-${c.month}`}>
                    <td className={`${tdClass} font-semibold`}>
                      {formatPeriod(c.year, c.month)}
                    </td>
                    <td className={tdClass}>
                      {c.points}
                      <span className="block text-xs text-zinc-500">
                        {formatBRL(c.ownCents)}
                      </span>
                    </td>
                    {clerk.isManager && (
                      <td className={tdClass}>
                        {c.teamPoints > 0 ? (
                          <>
                            <span className="font-semibold">
                              {formatBRL(c.bonusCents)}
                            </span>
                            <span className="block text-xs text-zinc-500">
                              5% de {c.teamPoints} pts da equipe
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    )}
                    <td className={`${tdClass} font-bold`}>
                      {formatBRL(c.amountCents)}
                    </td>
                    <td className={tdClass}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <div>
          <h2 className={sectionTitle}>Histórico de vendas</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Últimas {salesList.length} vendas registradas em seu nome.
          </p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Data</th>
                <th className={thClass}>Itens</th>
                <th className={thClass}>Pontos</th>
                <th className={thClass}>Cashback</th>
              </tr>
            </thead>
            <tbody>
              {salesList.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={4}>
                    Nenhuma venda registrada ainda. Peça ao gerente para cadastrar suas vendas.
                  </td>
                </tr>
              )}
              {salesList.map((s) => (
                <tr className={trClass} key={s.id}>
                  <td className={tdClass}>{formatDateTime(s.createdAt)}</td>
                  <td className={tdClass}>{s.items}</td>
                  <td className={tdClass}>{s.points}</td>
                  <td className={`${tdClass} font-semibold`}>{formatBRL(s.points * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
