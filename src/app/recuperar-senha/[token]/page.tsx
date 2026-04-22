import Link from "next/link";
import { AuthFrame } from "@/app/_components/auth-frame";
import { ResetPasswordForm } from "@/app/_components/reset-password-form";
import { verifyResetToken } from "@/lib/actions/password-reset";

export const metadata = { title: "Redefinir senha — Zera Estoque" };

export default async function ClerkResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const verified = await verifyResetToken(token);

  if (!verified || verified.kind !== "clerk") {
    return (
      <AuthFrame
        title="Link inválido"
        subtitle="Este link de redefinição não é válido ou expirou."
        footer={
          <p>
            <Link
              href="/esqueci-senha"
              className="font-bold text-[#027D04] hover:underline"
            >
              Solicitar um novo link
            </Link>
          </p>
        }
      >
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          O link pode ter expirado (são válidos por 1 hora) ou já foi usado.
          Solicite uma nova redefinição.
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Criar nova senha"
      subtitle="Escolha uma senha forte, com no mínimo 6 caracteres."
    >
      <ResetPasswordForm kind="clerk" token={token} />
    </AuthFrame>
  );
}
