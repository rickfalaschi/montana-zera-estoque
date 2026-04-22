import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { administrators } from "@/lib/db/schema";
import {
  badgeBrand,
  buttonPrimary,
  card,
  eyebrow,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/lib/ui";
import { formatDate } from "@/lib/format";
import { Pagination, resolvePagination } from "@/app/_components/pagination";
import { DeleteAdminButton } from "./delete-admin-button";

export const metadata = { title: "Admins — Admin" };

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const current = await requireAdmin();
  const [countRow] = await db.select({ count: count() }).from(administrators);
  const total = countRow.count;
  const { page, pageSize, offset } = resolvePagination(sp.page, total);

  const rows = await db
    .select({
      id: administrators.id,
      name: administrators.name,
      email: administrators.email,
      createdAt: administrators.createdAt,
    })
    .from(administrators)
    .orderBy(desc(administrators.createdAt))
    .limit(pageSize)
    .offset(offset);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Equipe Montana</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Admins
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {total} admin(s) com acesso ao painel administrativo.
          </p>
        </div>
        <Link href="/admin/admins/novo" className={buttonPrimary}>
          Novo admin
        </Link>
      </div>

      <div className={card}>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Nome</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>Cadastro</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={4}>
                    Nenhum admin cadastrado.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const isSelf = r.id === current.id;
                return (
                  <tr key={r.id} className={trClass}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{r.name}</span>
                        {isSelf && <span className={badgeBrand}>Você</span>}
                      </div>
                    </td>
                    <td className={tdClass}>{r.email}</td>
                    <td className={tdClass}>{formatDate(r.createdAt)}</td>
                    <td className={tdClass}>
                      {isSelf ? (
                        <span className="text-xs text-zinc-400">—</span>
                      ) : (
                        <DeleteAdminButton adminId={r.id} name={r.name} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalItems={total} baseHref="/admin/admins" />
      </div>

      <p className="text-xs text-zinc-500">
        Admins podem criar e gerenciar lojas, balconistas, produtos e cashbacks.
        Para alterar a própria senha, use a opção &quot;Esqueci minha senha&quot; no login.
      </p>
    </div>
  );
}
