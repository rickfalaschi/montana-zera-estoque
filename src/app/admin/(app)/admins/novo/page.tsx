import Link from "next/link";
import { buttonSecondary, eyebrow } from "@/lib/ui";
import { NewAdminForm } from "./new-admin-form";

export const metadata = { title: "Novo admin — Admin" };

export default function NewAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Equipe Montana</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Novo admin
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Crie uma nova conta de acesso ao painel administrativo. Comunique a
            senha ao novo admin por um canal seguro — ou peça pra ele usar
            &quot;Esqueci minha senha&quot; depois.
          </p>
        </div>
        <Link href="/admin/admins" className={buttonSecondary}>
          Cancelar
        </Link>
      </div>

      <NewAdminForm />
    </div>
  );
}
