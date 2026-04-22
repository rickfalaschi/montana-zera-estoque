import Link from "next/link";
import { AuthFrame } from "@/app/_components/auth-frame";
import { ForgotPasswordForm } from "@/app/_components/forgot-password-form";

export const metadata = { title: "Esqueci a senha — Zera Estoque" };

export default function ClerkForgotPasswordPage() {
  return (
    <AuthFrame
      title="Esqueci minha senha"
      subtitle="Informe o email do seu cadastro e enviamos um link para redefinir a senha."
      footer={
        <p>
          Lembrou?{" "}
          <Link href="/login" className="font-bold text-[#027D04] hover:underline">
            Voltar para o login
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm kind="clerk" />
    </AuthFrame>
  );
}
