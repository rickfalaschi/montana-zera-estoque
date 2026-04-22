import Link from "next/link";
import { AuthFrame } from "@/app/_components/auth-frame";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Cadastro — Zera Estoque" };

export default function SignupPage() {
  return (
    <AuthFrame
      title="Cadastro de balconista"
      subtitle="Informe seus dados e o CNPJ da loja onde você trabalha. O gerente aprova seu acesso depois."
      footer={
        <p>
          Já tem cadastro?{" "}
          <Link href="/login" className="font-bold text-[#027D04] hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthFrame>
  );
}
