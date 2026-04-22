import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { buttonSecondary, eyebrow } from "@/lib/ui";
import { formatCnpj } from "@/lib/format";
import { EditStoreForm } from "./edit-store-form";

export const metadata = { title: "Editar loja — Admin" };

export default async function EditStorePage({
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
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  if (!store) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Edição</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Editar loja
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Atualize os dados cadastrais de <strong>{store.name}</strong> — CNPJ{" "}
            {formatCnpj(store.cnpj)}.
          </p>
        </div>
        <Link href="/admin/lojas" className={buttonSecondary}>
          Cancelar
        </Link>
      </div>

      <EditStoreForm
        storeId={store.id}
        initial={{
          name: store.name,
          cnpj: store.cnpj,
          legalName: store.legalName,
          address: store.address,
          city: store.city,
          state: store.state,
          zipcode: store.zipcode,
          phone: store.phone,
        }}
      />
    </div>
  );
}
