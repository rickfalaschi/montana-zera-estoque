import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clerks, stores } from "@/lib/db/schema";
import { buttonSecondary, eyebrow } from "@/lib/ui";
import { formatCpf } from "@/lib/format";
import { AdminEditClerkForm } from "./admin-edit-clerk-form";

export const metadata = { title: "Editar balconista — Admin" };

export default async function AdminEditClerkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clerkId = Number(id);
  if (!Number.isFinite(clerkId)) notFound();

  const [clerk] = await db
    .select({
      id: clerks.id,
      name: clerks.name,
      email: clerks.email,
      cpf: clerks.cpf,
      rg: clerks.rg,
      phone: clerks.phone,
      birthDate: clerks.birthDate,
      pixKey: clerks.pixKey,
      isManager: clerks.isManager,
      isApproved: clerks.isApproved,
      storeId: stores.id,
      storeName: stores.name,
    })
    .from(clerks)
    .innerJoin(stores, eq(stores.id, clerks.storeId))
    .where(eq(clerks.id, clerkId))
    .limit(1);
  if (!clerk) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Edição</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Editar balconista
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {clerk.name} — CPF {formatCpf(clerk.cpf)} — Loja{" "}
            <strong>{clerk.storeName}</strong>.
          </p>
        </div>
        <Link href="/admin/balconistas" className={buttonSecondary}>
          Cancelar
        </Link>
      </div>

      <AdminEditClerkForm
        clerkId={clerk.id}
        initial={{
          name: clerk.name,
          email: clerk.email,
          cpf: clerk.cpf,
          rg: clerk.rg,
          phone: clerk.phone,
          birthDate: clerk.birthDate,
          pixKey: clerk.pixKey,
          isManager: clerk.isManager,
          isApproved: clerk.isApproved,
        }}
      />
    </div>
  );
}
