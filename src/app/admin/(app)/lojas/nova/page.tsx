import Link from "next/link";
import { buttonSecondary, eyebrow } from "@/lib/ui";
import { NewStoreForm } from "./new-store-form";

export const metadata = { title: "Nova loja — Admin" };

export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Cadastro</span>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Nova loja
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Cadastre a loja e o balconista gerente responsável.
          </p>
        </div>
        <Link href="/admin/lojas" className={buttonSecondary}>
          Cancelar
        </Link>
      </div>
      <NewStoreForm />
    </div>
  );
}
