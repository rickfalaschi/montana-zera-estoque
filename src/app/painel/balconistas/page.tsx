import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { requireManager } from "@/lib/dal";
import { db } from "@/lib/db";
import { clerks } from "@/lib/db/schema";
import {
  badgeBrand,
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
import { formatCpf, formatDate } from "@/lib/format";
import { ApproveReject } from "./approve-reject";

export const metadata = { title: "Balconistas — Zera Estoque" };

export default async function ClerksPage() {
  const manager = await requireManager();
  const rows = await db
    .select({
      id: clerks.id,
      name: clerks.name,
      email: clerks.email,
      cpf: clerks.cpf,
      isManager: clerks.isManager,
      isApproved: clerks.isApproved,
      createdAt: clerks.createdAt,
    })
    .from(clerks)
    .where(eq(clerks.storeId, manager.storeId))
    .orderBy(asc(clerks.isApproved), desc(clerks.createdAt));

  const pending = rows.filter((r) => !r.isApproved);
  const approved = rows.filter((r) => r.isApproved);

  return (
    <div className="space-y-8">
      <div>
        <span className={eyebrow}>Equipe da loja</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Balconistas
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Aprove o cadastro e mantenha atualizados os dados da equipe da{" "}
          <span className="font-semibold text-zinc-900 dark:text-white">{manager.storeName}</span>.
        </p>
      </div>

      <section className={card}>
        <div className="flex items-center gap-3">
          <h2 className={sectionTitle}>Aguardando aprovação</h2>
          <span className={badgeBrand}>{pending.length}</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Nome</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>CPF</th>
                <th className={thClass}>Cadastro</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={5}>
                    Nenhum balconista aguardando aprovação.
                  </td>
                </tr>
              )}
              {pending.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={tdClass}>{r.name}</td>
                  <td className={tdClass}>{r.email}</td>
                  <td className={tdClass}>{formatCpf(r.cpf)}</td>
                  <td className={tdClass}>{formatDate(r.createdAt)}</td>
                  <td className={tdClass}>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/painel/balconistas/${r.id}/editar`}
                        className={`${buttonSecondary} h-8 px-3 text-xs`}
                      >
                        Editar
                      </Link>
                      <ApproveReject clerkId={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <div className="flex items-center gap-3">
          <h2 className={sectionTitle}>Aprovados</h2>
          <span className={badgeNeutral}>{approved.length}</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr className={trClass}>
                <th className={thClass}>Nome</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>CPF</th>
                <th className={thClass}>Papel</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {approved.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={tdClass}>{r.name}</td>
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
                    <div className="flex justify-end">
                      <Link
                        href={`/painel/balconistas/${r.id}/editar`}
                        className={`${buttonSecondary} h-8 px-3 text-xs`}
                      >
                        Editar
                      </Link>
                    </div>
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
