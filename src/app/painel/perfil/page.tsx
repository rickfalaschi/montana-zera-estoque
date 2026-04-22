import { requireClerk } from "@/lib/dal";
import { card, eyebrow, sectionTitle } from "@/lib/ui";
import { formatCnpj, formatCpf } from "@/lib/format";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Meu perfil — Zera Estoque" };

export default async function ProfilePage() {
  const clerk = await requireClerk();

  return (
    <div className="space-y-8">
      <div>
        <span className={eyebrow}>Meu cadastro</span>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          Meu perfil
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Mantenha seus dados sempre atualizados — é por aqui que a Montana
          envia seu cashback via Pix.
        </p>
      </div>

      <section className={card}>
        <h2 className={sectionTitle}>Dados cadastrais</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Para corrigir qualquer um destes dados, peça ao gerente da loja.
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <Field label="Nome" value={clerk.name} />
          <Field label="Email" value={clerk.email} />
          <Field label="CPF" value={formatCpf(clerk.cpf)} />
          <Field label="Papel" value={clerk.isManager ? "Gerente" : "Balconista"} />
          <Field label="Loja" value={clerk.storeName} />
          <Field label="CNPJ da loja" value={formatCnpj(clerk.storeCnpj)} />
        </dl>
      </section>

      <section className={card}>
        <h2 className={sectionTitle}>Chave Pix para recebimento</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Informe a chave Pix que a Montana vai usar para te pagar o cashback
          todo mês. Pode ser CPF, email, celular ou chave aleatória.
        </p>
        <div className="mt-5">
          <ProfileForm initialPixKey={clerk.pixKey} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-zinc-900 dark:text-white">{value}</dd>
    </div>
  );
}
