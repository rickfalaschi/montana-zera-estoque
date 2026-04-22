import Link from "next/link";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cashbackPayments, clerks, products, saleItems, sales, stores } from "@/lib/db/schema";
import { card, eyebrow } from "@/lib/ui";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Admin — Zera Estoque" };

export default async function AdminDashboardPage() {
  const [
    [storesCount],
    [clerksCount],
    [pendingCount],
    [salesCount],
    [productsCount],
    [pointsAgg],
    [paidAgg],
  ] = await Promise.all([
    db.select({ count: count() }).from(stores),
    db.select({ count: count() }).from(clerks),
    db.select({ count: count() }).from(clerks).where(eq(clerks.isApproved, false)),
    db.select({ count: count() }).from(sales),
    db.select({ count: count() }).from(products).where(eq(products.active, true)),
    db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${saleItems.quantity} * ${saleItems.pointsEach}), 0)::int`,
      })
      .from(saleItems),
    db
      .select({
        paidCents: sql<number>`COALESCE(SUM(${cashbackPayments.amountCents}), 0)::int`,
      })
      .from(cashbackPayments),
  ]);

  const totalCashbackCents = pointsAgg.totalPoints * 100;
  const pendingCents = totalCashbackCents - paidAgg.paidCents;

  const navCards = [
    { label: "Lojas ativas", value: storesCount.count, href: "/admin/lojas" },
    {
      label: "Balconistas",
      value: clerksCount.count,
      badge:
        pendingCount.count > 0
          ? `${pendingCount.count} pendente${pendingCount.count === 1 ? "" : "s"}`
          : null,
      href: "/admin/balconistas",
    },
    { label: "Produtos ativos", value: productsCount.count, href: "/admin/produtos" },
    { label: "Vendas totais", value: salesCount.count, href: "/admin/vendas" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <span className={eyebrow}>Painel Montana</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Visão geral
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Resumo da campanha Zera Estoque.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {navCards.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="group rounded-2xl bg-white p-6 transition hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {k.label}
              </p>
              <span className="text-zinc-400 opacity-0 transition group-hover:opacity-100">
                →
              </span>
            </div>
            <p className="mt-3 text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              {k.value}
            </p>
            {k.badge && (
              <p className="mt-2 text-xs font-semibold text-[#A80000]">{k.badge}</p>
            )}
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#2c0000] via-[#3f0000] to-[#1a0000] p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Total em cashback gerado
          </p>
          <p className="mt-3 text-4xl font-black tracking-tight">
            {formatBRL(totalCashbackCents)}
          </p>
          <p className="mt-2 text-xs text-white/70">
            Soma de todos os meses fechados e em andamento.
          </p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Pago até agora
          </p>
          <p className="mt-3 text-4xl font-black tracking-tight text-[#027D04]">
            {formatBRL(paidAgg.paidCents)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Pagamentos confirmados pela equipe.</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Em aberto (estimativa)
          </p>
          <p className="mt-3 text-4xl font-black tracking-tight text-[#A80000]">
            {formatBRL(pendingCents)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Inclui meses fechados não pagos e o mês em andamento.
          </p>
        </div>
      </section>
    </div>
  );
}
