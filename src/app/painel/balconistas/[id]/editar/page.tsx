import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireManager } from "@/lib/dal";
import { db } from "@/lib/db";
import { clerks } from "@/lib/db/schema";
import { buttonSecondary, card, eyebrow } from "@/lib/ui";
import { formatCpf } from "@/lib/format";
import { EditClerkForm } from "./edit-clerk-form";

export const metadata = { title: "Editar balconista — Zera Estoque" };

export default async function EditClerkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const manager = await requireManager();
  const { id } = await params;
  const clerkId = Number(id);
  if (!Number.isFinite(clerkId)) notFound();

  const [clerk] = await db
    .select({
      id: clerks.id,
      name: clerks.name,
      email: clerks.email,
      cpf: clerks.cpf,
      isManager: clerks.isManager,
      isApproved: clerks.isApproved,
    })
    .from(clerks)
    .where(and(eq(clerks.id, clerkId), eq(clerks.storeId, manager.storeId)))
    .limit(1);
  if (!clerk) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>
            {clerk.isManager ? "Gerente da loja" : "Balconista"}
            {clerk.isApproved ? "" : " · Pendente"}
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Editar cadastro
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Atualize os dados de {clerk.name} — CPF {formatCpf(clerk.cpf)}.
          </p>
        </div>
        <Link href="/painel/balconistas" className={buttonSecondary}>
          Cancelar
        </Link>
      </div>

      <section className={card}>
        <EditClerkForm
          clerkId={clerk.id}
          initial={{ name: clerk.name, email: clerk.email, cpf: clerk.cpf }}
        />
      </section>
    </div>
  );
}
