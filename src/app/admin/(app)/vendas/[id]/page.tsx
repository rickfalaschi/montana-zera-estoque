import Link from "next/link";
import { notFound } from "next/navigation";
import { alias } from "drizzle-orm/pg-core";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks, products, saleItems, sales, stores } from "@/lib/db/schema";
import {
  buttonSecondary,
  card,
  eyebrow,
  sectionTitle,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import { formatBRL, formatCnpj, formatCpf, formatDateTime } from "@/lib/format";

export const metadata = { title: "Detalhes da venda — Admin" };

const creator = alias(clerks, "creator");
const saleClerk = alias(clerks, "sale_clerk");

export default async function AdminSaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const saleId = Number(id);
  if (!Number.isFinite(saleId)) notFound();

  const [sale] = await db
    .select({
      id: sales.id,
      createdAt: sales.createdAt,
      clerkId: sales.clerkId,
      clerkName: saleClerk.name,
      clerkEmail: saleClerk.email,
      clerkCpf: saleClerk.cpf,
      clerkPixKey: saleClerk.pixKey,
      clerkIsManager: saleClerk.isManager,
      storeId: sales.storeId,
      storeName: stores.name,
      storeCnpj: stores.cnpj,
      createdById: sales.createdById,
      createdByName: creator.name,
    })
    .from(sales)
    .innerJoin(saleClerk, eq(saleClerk.id, sales.clerkId))
    .innerJoin(stores, eq(stores.id, sales.storeId))
    .innerJoin(creator, eq(creator.id, sales.createdById))
    .where(eq(sales.id, saleId))
    .limit(1);
  if (!sale) notFound();

  const items = await db
    .select({
      id: saleItems.id,
      productId: saleItems.productId,
      productName: products.name,
      productActive: products.active,
      quantity: saleItems.quantity,
      pointsEach: saleItems.pointsEach,
    })
    .from(saleItems)
    .innerJoin(products, eq(products.id, saleItems.productId))
    .where(eq(saleItems.saleId, saleId))
    .orderBy(asc(saleItems.id));

  const totalPoints = items.reduce((acc, i) => acc + i.quantity * i.pointsEach, 0);
  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Venda #{sale.id}</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Detalhes da venda
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Registrada em {formatDateTime(sale.createdAt)}.
          </p>
        </div>
        <Link href="/admin/vendas" className={buttonSecondary}>
          ← Voltar
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={card}>
          <h2 className={sectionTitle}>Balconista</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <Field label="Nome" value={sale.clerkName} />
            <Field
              label="Papel"
              value={sale.clerkIsManager ? "Gerente da loja" : "Balconista"}
            />
            <Field label="Email" value={sale.clerkEmail} />
            <Field label="CPF" value={formatCpf(sale.clerkCpf)} />
            <Field
              label="Chave Pix"
              value={sale.clerkPixKey ?? "—"}
              muted={!sale.clerkPixKey}
            />
          </dl>
        </div>
        <div className={card}>
          <h2 className={sectionTitle}>Loja</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <Field label="Nome" value={sale.storeName} />
            <Field label="CNPJ" value={formatCnpj(sale.storeCnpj)} />
            <Field
              label="Cadastrada por"
              value={
                sale.createdById === sale.clerkId
                  ? `${sale.createdByName} (o próprio balconista, como gerente)`
                  : sale.createdByName
              }
            />
          </dl>
        </div>
      </section>

      <section className={card}>
        <h2 className={sectionTitle}>Itens vendidos</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Os pontos registrados são os vigentes no momento do cadastro da venda.
          Não mudam se o produto for editado depois.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Produto</th>
                <th className={thClass}>Qtd.</th>
                <th className={thClass}>Pontos unitários</th>
                <th className={thClass}>Pontos</th>
                <th className={thClass}>Cashback</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const subtotalPts = it.quantity * it.pointsEach;
                return (
                  <tr key={it.id} className={trClass}>
                    <td className={tdClass}>
                      <span className="font-semibold">{it.productName}</span>
                      {!it.productActive && (
                        <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          Produto inativo hoje
                        </span>
                      )}
                    </td>
                    <td className={tdClass}>{it.quantity}</td>
                    <td className={tdClass}>{it.pointsEach} pts</td>
                    <td className={tdClass}>{subtotalPts}</td>
                    <td className={tdClass}>{formatBRL(subtotalPts * 100)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-zinc-300 dark:border-zinc-700">
                <td className={`${tdClass} font-bold uppercase text-xs tracking-widest text-zinc-500`}>
                  Total
                </td>
                <td className={`${tdClass} font-semibold`}>{totalUnits}</td>
                <td className={tdClass}></td>
                <td className={`${tdClass} font-bold`}>{totalPoints}</td>
                <td className={`${tdClass} font-black text-[#027D04]`}>
                  {formatBRL(totalPoints * 100)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </dt>
      <dd
        className={`mt-0.5 ${
          muted
            ? "italic text-zinc-400"
            : "font-semibold text-zinc-900 dark:text-white"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
