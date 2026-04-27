import Link from "next/link";
import { AuthFrame } from "@/app/_components/auth-frame";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar — Zera Estoque" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;
  const resetOk = params.reset === "ok";

  return (
    <AuthFrame
      title="Entrar na plataforma"
      subtitle="Acesso de balconistas e gerentes de loja."
      footer={
        <p>
          Ainda não tem cadastro?{" "}
          <Link href="/cadastro" className="font-bold text-[#027D04] hover:underline">
            Cadastre-se
          </Link>
        </p>
      }
    >
      {resetOk && (
        <div className="mb-4 rounded-lg border border-[#027D04]/30 bg-[#027D04]/10 p-3 text-sm text-[#015701]">
          Senha redefinida com sucesso. Faça login com sua nova senha.
        </div>
      )}
      <LoginForm />
      <p className="mt-4 text-right text-xs">
        <Link
          href="/esqueci-senha"
          className="font-semibold text-zinc-500 hover:text-[#A80000] hover:underline"
        >
          Esqueci minha senha
        </Link>
      </p>
    </AuthFrame>
  );
}
