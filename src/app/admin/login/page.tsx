import Link from "next/link";
import { AuthFrame } from "@/app/_components/auth-frame";
import { AdminLoginForm } from "./admin-login-form";

export const metadata = { title: "Admin — Zera Estoque" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;
  const resetOk = params.reset === "ok";

  return (
    <AuthFrame
      variant="admin"
      title="Painel administrativo"
      subtitle="Acesso restrito à equipe Montana."
    >
      {resetOk && (
        <div className="mb-4 rounded-lg border border-[#027D04]/30 bg-[#027D04]/10 p-3 text-sm text-[#015701]">
          Senha redefinida com sucesso. Faça login com sua nova senha.
        </div>
      )}
      <AdminLoginForm />
      <p className="mt-4 text-right text-xs">
        <Link
          href="/admin/esqueci-senha"
          className="font-semibold text-zinc-500 hover:text-[#A80000] hover:underline"
        >
          Esqueci minha senha
        </Link>
      </p>
    </AuthFrame>
  );
}
