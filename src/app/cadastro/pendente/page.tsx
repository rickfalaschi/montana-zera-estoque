import Link from "next/link";
import { AuthFrame } from "@/app/_components/auth-frame";
import { buttonPrimary } from "@/lib/ui";

export const metadata = { title: "Cadastro enviado — Zera Estoque" };

export default function PendingPage() {
  return (
    <AuthFrame
      title="Cadastro enviado!"
      subtitle="Seu pré-cadastro foi recebido. O gerente da loja precisa aprovar seu acesso antes do primeiro login."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded-xl border border-[#027D04]/20 bg-[#027D04]/5 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#027D04] text-white shadow">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-8 8a1 1 0 01-1.42 0l-4-4a1 1 0 111.42-1.42L8 12.585l7.29-7.29a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-200">
            Enquanto isso, você não consegue entrar. Assim que o gerente
            aprovar, seu acesso fica liberado.
          </div>
        </div>

        <Link href="/login" className={`${buttonPrimary} w-full`}>
          Ir para o login
        </Link>
      </div>
    </AuthFrame>
  );
}
