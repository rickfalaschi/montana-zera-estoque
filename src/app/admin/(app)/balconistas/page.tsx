import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks, stores } from "@/lib/db/schema";
import {
  badgeBrand,
  badgeNeutral,
  badgeSuccess,
  badgeWarning,
  card,
  eyebrow,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import { formatCpf, formatDate } from "@/lib/format";
import { ClerkActions } from "./clerk-actions";
import { Pagination, resolvePagination } from "@/app/_components/pagination";

export const metadata = { title: "Balconistas — Admin" };

export default async function AdminClerksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const [countRow] = await db.select({ count: count() }).from(clerks);
  const total = countRow.count;

  const { page, pageSize, offset } = resolvePagination(sp.page, total);

  const rows = await db
    .select({
      id: clerks.id,
      name: clerks.name,
      email: clerks.email,
      cpf: clerks.cpf,
      isManager: clerks.isManager,
      isApproved: clerks.isApproved,
      createdAt: clerks.createdAt,
      storeName: stores.name,
    })
    .from(clerks)
    .innerJoin(stores, eq(stores.id, clerks.storeId))
    .orderBy(asc(clerks.isApproved), desc(clerks.createdAt))
    .limit(pageSize)
    .offset(offset);

  return (
    <div className="space-y-6">
      <div>
        <span className={eyebrow}>Pessoas</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Balconistas
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Todos os {total} balconistas cadastrados na plataforma.
        </p>
      </div>
      <div className={card}>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Nome</th>
                <th className={thClass}>Loja</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>CPF</th>
                <th className={thClass}>Papel</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Cadastro</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={8}>
                    Nenhum balconista cadastrado.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={tdClass}>{r.name}</td>
                  <td className={tdClass}>{r.storeName}</td>
                  <td className={tdClass}>{r.email}</td>
                  <td className={tdClass}>{formatCpf(r.cpf)}</td>
                  <td className={tdClass}>
                    {r.isManager ? (
                      <span className={badgeBrand}>Gerente</span>
                    ) : (
                      <span className={badgeNeutral}>Balconista</span>
                    )}
                  </td>
                  <td className={tdClass}>
                    {r.isApproved ? (
                      <span className={badgeSuccess}>Aprovado</span>
                    ) : (
                      <span className={badgeWarning}>Pendente</span>
                    )}
                  </td>
                  <td className={tdClass}>{formatDate(r.createdAt)}</td>
                  <td className={tdClass}>
                    <ClerkActions
                      clerkId={r.id}
                      isApproved={r.isApproved}
                      isManager={r.isManager}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalItems={total} baseHref="/admin/balconistas" />
      </div>
    </div>
  );
}
