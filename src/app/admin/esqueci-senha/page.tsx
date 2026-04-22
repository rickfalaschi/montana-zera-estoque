import Link from "next/link";
import { AuthFrame } from "@/app/_components/auth-frame";
import { ForgotPasswordForm } from "@/app/_components/forgot-password-form";

export const metadata = { title: "Admin — Esqueci a senha" };

export default function AdminForgotPasswordPage() {
  return (
    <AuthFrame
      variant="admin"
      title="Esqueci minha senha"
      subtitle="Informe o email administrativo e enviamos um link para redefinir a senha."
      footer={
        <p>
          Lembrou?{" "}
          <Link
            href="/admin/login"
            className="font-bold text-[#027D04] hover:underline"
          >
            Voltar para o login
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm kind="admin" />
    </AuthFrame>
  );
}
