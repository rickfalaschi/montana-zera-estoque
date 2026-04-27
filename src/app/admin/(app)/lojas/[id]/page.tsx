import Link from "next/link";
import { notFound } from "next/navigation";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks, saleItems, sales, stores } from "@/lib/db/schema";
import {
  badgeBrand,
  badgeDanger,
  badgeNeutral,
  buttonSecondary,
  card,
  eyebrow,
  sectionTitle,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import {
  formatBRL,
  formatCep,
  formatCnpj,
  formatCpf,
  formatDate,
  formatPhone,
} from "@/lib/format";
import { MANAGER_BONUS_CENTS_PER_POINT } from "@/lib/cashback";
import { DeleteStoreButton } from "../delete-store-button";

export const metadata = { title: "Loja — Admin" };

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = Number(id);
  if (!Number.isFinite(storeId)) notFound();

  const [store] = await db
    .select({
      id: stores.id,
      name: stores.name,
      cnpj: stores.cnpj,
      legalName: stores.legalName,
      address: stores.address,
      city: stores.city,
      state: stores.state,
      zipcode: stores.zipcode,
      phone: stores.phone,
      createdAt: stores.createdAt,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  if (!store) notFound();

  const pointsExpr = sql<number>`COALESCE(SUM(${saleItems.quantity} * ${saleItems.pointsEach}), 0)::float8`;

  const [
    [manager],
    [clerksStat],
    [salesStat],
    [storePointsRow],
    topSellers,
  ] = await Promise.all([
    db
      .select({
        id: clerks.id,
        name: clerks.name,
        email: clerks.email,
        cpf: clerks.cpf,
        phone: clerks.phone,
        pixKey: clerks.pixKey,
      })
      .from(clerks)
      .where(and(eq(clerks.storeId, storeId), eq(clerks.isManager, true)))
      .limit(1),

    db
      .select({ count: count() })
      .from(clerks)
      .where(eq(clerks.storeId, storeId)),

    db
      .select({ count: count() })
      .from(sales)
      .where(eq(sales.storeId, storeId)),

    db
      .select({ points: pointsExpr })
      .from(sales)
      .innerJoin(saleItems, eq(saleItems.saleId, sales.id))
      .where(eq(sales.storeId, storeId)),

    db
      .select({
        id: clerks.id,
        name: clerks.name,
        cpf: clerks.cpf,
        isManager: clerks.isManager,
        isApproved: clerks.isApproved,
        points: pointsExpr,
        salesCount: sql<number>`COUNT(DISTINCT ${sales.id})::int`,
      })
      .from(clerks)
      .leftJoin(sales, eq(sales.clerkId, clerks.id))
      .leftJoin(saleItems, eq(saleItems.saleId, sales.id))
      .where(eq(clerks.storeId, storeId))
      .groupBy(clerks.id, clerks.name, clerks.cpf, clerks.isManager, clerks.isApproved)
      .orderBy(desc(pointsExpr), clerks.name),
  ]);

  const storePoints = storePointsRow?.points ?? 0;
  const clerksOwnCashbackCents = storePoints * 100;
  const managerBonusCents = manager
    ? storePoints * MANAGER_BONUS_CENTS_PER_POINT
    : 0;
  const totalCashbackCents = clerksOwnCashbackCents + managerBonusCents;

  const citySummary =
    store.city && store.state ? `${store.city}/${store.state}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className={eyebrow}>Rede</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {store.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            CNPJ {formatCnpj(store.cnpj)}
            {citySummary && <> · {citySummary}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/lojas" className={buttonSecondary}>
            ← Voltar
          </Link>
          <Link
            href={`/admin/lojas/${store.id}/editar`}
            className={buttonSecondary}
          >
            Editar
          </Link>
          <DeleteStoreButton storeId={store.id} />
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Total de vendas
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {salesStat.count}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {storePoints} pontos vendidos
          </p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Cashback gerado
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {formatBRL(totalCashbackCents)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatBRL(clerksOwnCashbackCents)} balconistas +{" "}
            {formatBRL(managerBonusCents)} bônus
          </p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Balconistas
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {clerksStat.count}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Total na loja</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Cadastrada em
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {formatDate(store.createdAt)}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={card}>
          <h2 className={sectionTitle}>Dados cadastrais</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <Field label="Nome fantasia" value={store.name} />
            <Field label="Razão social" value={store.legalName} />
            <Field label="CNPJ" value={formatCnpj(store.cnpj)} />
            <Field label="Endereço" value={store.address} />
            <Field
              label="Cidade / UF"
              value={
                store.city || store.state
                  ? `${store.city ?? "—"}${store.state ? ` / ${store.state}` : ""}`
                  : null
              }
            />
            <Field label="CEP" value={store.zipcode ? formatCep(store.zipcode) : null} />
            <Field label="Telefone" value={store.phone ? formatPhone(store.phone) : null} />
          </dl>
        </div>

        <div className={card}>
          <h2 className={sectionTitle}>Gerente atual</h2>
          {manager ? (
            <dl className="mt-5 space-y-4 text-sm">
              <Field label="Nome" value={manager.name} />
              <Field label="Email" value={manager.email} />
              <Field label="CPF" value={formatCpf(manager.cpf)} />
              <Field
                label="Telefone"
                value={manager.phone ? formatPhone(manager.phone) : null}
              />
              <Field label="Chave Pix" value={manager.pixKey} />
              <div>
                <Link
                  href={`/admin/balconistas/${manager.id}/editar`}
                  className={`${buttonSecondary} h-8 px-3 text-xs`}
                >
                  Editar cadastro
                </Link>
              </div>
            </dl>
          ) : (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <p className="font-semibold">Loja sem gerente.</p>
              <p className="mt-1 text-xs">
                Novos balconistas não podem ser aprovados e vendas não podem ser
                cadastradas sem um gerente ativo. Promova um dos balconistas da
                loja.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={sectionTitle}>Top vendedores</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Ranking de todos os tempos, por cashback gerado em vendas
              próprias.
            </p>
          </div>
          <Link
            href={`/admin/vendas?q=${encodeURIComponent(
              `Loja: ${store.name} — ${formatCnpj(store.cnpj)}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#A80000] hover:underline"
          >
            Ver todas as vendas ↗
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>#</th>
                <th className={thClass}>Balconista</th>
                <th className={thClass}>Papel</th>
                <th className={thClass}>Vendas</th>
                <th className={thClass}>Pontos</th>
                <th className={thClass}>Cashback das vendas</th>
              </tr>
            </thead>
            <tbody>
              {topSellers.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={6}>
                    Nenhum balconista cadastrado ainda.
                  </td>
                </tr>
              )}
              {topSellers.map((t, i) => (
                <tr key={t.id} className={trClass}>
                  <td className={`${tdClass} w-10 font-semibold text-zinc-500`}>
                    {i + 1}
                  </td>
                  <td className={tdClass}>
                    <Link
                      href={`/admin/balconistas/${t.id}/editar`}
                      className="font-semibold hover:text-[#A80000] hover:underline"
                    >
                      {t.name}
                    </Link>
                    <span className="block text-xs text-zinc-500">
                      {formatCpf(t.cpf)}
                    </span>
                  </td>
                  <td className={tdClass}>
                    {t.isManager ? (
                      <span className={badgeBrand}>Gerente</span>
                    ) : t.isApproved ? (
                      <span className={badgeNeutral}>Balconista</span>
                    ) : (
                      <span className={badgeDanger}>Pendente</span>
                    )}
                  </td>
                  <td className={tdClass}>{t.salesCount}</td>
                  <td className={tdClass}>{t.points}</td>
                  <td className={`${tdClass} font-semibold`}>
                    {formatBRL(t.points * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </dt>
      <dd
        className={`mt-0.5 ${
          value
            ? "font-semibold text-zinc-900 dark:text-white"
            : "italic text-zinc-400"
        }`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
