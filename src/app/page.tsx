import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#2c0000]">
      {/* Top bar / header */}
      <header className="sticky top-0 z-30 bg-[#4a1f0b]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center" aria-label="Montana — Zera Estoque">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-off.svg"
              alt="Montana"
              width={160}
              height={52}
              className="h-9 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 text-sm">
            {/* Entrar (link) — desktop */}
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 font-semibold text-white hover:bg-white/10 sm:inline-flex"
            >
              Entrar
            </Link>
            {/* Entrar (botão verde) — mobile */}
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-[#027D04] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-black/20 transition hover:bg-[#015701] sm:hidden"
            >
              Entrar
            </Link>
            {/* Cadastre-se — desktop */}
            <Link
              href="/cadastro"
              className="hidden items-center rounded-full bg-[#027D04] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-black/20 transition hover:bg-[#015701] sm:inline-flex"
            >
              Cadastre-se
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 30%, #a80000 0%, #7a0000 55%, #3f0000 100%)",
        }}
      >
        {/* sunburst rays */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-conic-gradient(from 0deg at 50% 40%, rgba(255,255,255,0.15) 0deg 2deg, transparent 2deg 10deg)",
          }}
        />
        {/* subtle dot pattern top-right */}
        <div
          aria-hidden
          className="absolute right-8 top-16 h-32 w-32 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,190,0,0.7) 2px, transparent 2px)",
            backgroundSize: "14px 14px",
          }}
        />
        {/* subtle dot pattern bottom-left */}
        <div
          aria-hidden
          className="absolute bottom-24 left-8 h-24 w-24 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.7) 2px, transparent 2px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-12 pb-0 md:pt-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <Image
                src="/images/logo.png"
                alt="Operação Zera Estoque — Montana"
                width={700}
                height={640}
                priority
                className="mx-auto w-full max-w-md drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] md:mx-0"
              />
            </div>
            <div className="order-1 md:order-2">
              <span className="inline-flex items-center rounded-full bg-[#FFBE00] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#3f0000]">
                Campanha 2026
              </span>
              <h1 className="mt-4 text-3xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">
                Você vende <span className="text-[#FFBE00]">Montana</span>,
                <br />
                acumula pontos e
                <br />
                ainda recebe <span className="text-[#FFBE00]">Pix!</span>
              </h1>
              <p className="mt-5 max-w-md text-lg font-bold text-white/90">
                Bora faturar!!! Cada produto vendido vira ponto —
                <span className="ml-1 text-[#FFBE00]">1 ponto = R$ 1,00</span>{" "}
                de cashback, pago todo mês.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/cadastro"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-[#027D04] px-10 text-base font-black uppercase tracking-wide text-white shadow-xl shadow-black/30 transition hover:bg-[#015701]"
                >
                  Cadastre-se
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white/50 px-8 text-sm font-bold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
                >
                  Já tenho cadastro
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Produtos (centralizados, encostando na faixa verde abaixo) */}
        <div className="relative mt-6 md:mt-10">
          <Image
            src="/images/produtos.png"
            alt="Linha de produtos Montana"
            width={2216}
            height={656}
            priority
            className="mx-auto block w-full max-w-5xl px-6 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Faixa verde reta — direto abaixo dos produtos, sem margem */}
        <div className="relative h-20 bg-[#027D04] md:h-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay"
            style={{
              backgroundImage: "url('/images/textura.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto 100%",
            }}
          />
        </div>
      </section>

      {/* COMO PARTICIPAR */}
      <section
        className="relative overflow-hidden py-20"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #a80000 0%, #7a0000 60%, #2c0000 100%)",
        }}
      >
        {/* decorative dots */}
        <div
          aria-hidden
          className="absolute right-10 top-20 h-24 w-24 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 2px, transparent 2px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-20 left-10 h-24 w-24 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,190,0,0.9) 2px, transparent 2px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
              Como Participar
            </h2>
            <p className="mt-3 text-lg font-bold text-[#FFBE00]">
              É muito fácil! 3 passos simples para ganhar cashback!
            </p>
          </div>

          <div className="mt-14 grid gap-12 md:grid-cols-2">
            {/* Passos */}
            <ol className="space-y-8">
              {[
                {
                  n: 1,
                  t: "Cadastre-se no site como balconista Montana.",
                  d: "É rápido: nome, e-mail, CPF e o CNPJ da loja onde você trabalha.",
                },
                {
                  n: 2,
                  t: "O gerente da sua loja registra as vendas Montana na plataforma.",
                  d: "Cada item vendido vira pontos — acompanhe em tempo real no seu painel.",
                },
                {
                  n: 3,
                  t: "Acumule pontos, acompanhe e resgate por Pix todo mês.",
                  d: "1 ponto = R$ 1,00 de cashback. Virou o mês, o pagamento libera.",
                },
              ].map((s) => (
                <li key={s.n} className="flex items-start gap-5">
                  <span
                    aria-hidden
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] border-white/90 text-3xl font-black text-[#FFBE00]"
                  >
                    {s.n}
                  </span>
                  <div>
                    <p className="text-xl font-extrabold leading-tight text-white">
                      {s.t}
                    </p>
                    <p className="mt-1 text-sm text-white/80">{s.d}</p>
                  </div>
                </li>
              ))}
              <li className="rounded-2xl border-[2px] border-[#FFBE00] p-5">
                <p className="font-bold text-[#FFBE00]">
                  Pronto! Seus pontos serão contabilizados automaticamente.
                </p>
                <p className="mt-1 text-sm text-white/90">
                  Acompanhe suas pontuações e o valor pra resgate direto no
                  painel do balconista.
                </p>
              </li>
            </ol>

            {/* Condições */}
            <div>
              <h3 className="text-2xl font-black uppercase tracking-wide text-[#FFBE00]">
                Condições Gerais
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/90">
                {[
                  "Valor mínimo para o resgate do cashback é de R$ 50,00 (cinquenta reais) mensal.",
                  "Participação elegível apenas para balconistas em concordância com a Montana Química.",
                  "As vendas devem ser realizadas dentro do período da campanha. Não serão aceitas vendas realizadas anterior ou posteriormente ao período.",
                  "As vendas devem ser registradas no mês em que ocorreram. O gerente da loja é o responsável pelo cadastro na plataforma.",
                  "A contabilização dos pontos é feita automaticamente a partir do registro da venda na plataforma, e pode ser auditada pela Montana Química.",
                  "A Montana Química se reserva o direito de validar e auditar os cadastros e as vendas para garantir a veracidade das informações.",
                  "Notando qualquer irregularidade com a loja e o balconista participante, os mesmos serão excluídos da campanha de forma irrevogável.",
                  "Para mais informações, consulte as regras completas da campanha.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[6px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#FFBE00]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16 flex flex-col items-center gap-5 text-center">
            <h3 className="text-3xl font-black uppercase text-[#FFBE00] sm:text-4xl">
              Não perca tempo!
              <br />
              <span className="text-white">Comece ainda hoje a ganhar!</span>
            </h3>
            <Link
              href="/cadastro"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#027D04] px-12 text-base font-black uppercase tracking-wide text-white shadow-xl shadow-black/40 transition hover:bg-[#015701]"
            >
              Quero meu cashback
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a0000] py-8 text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} Montana Química</p>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Operação Zera Estoque — plataforma de cashback
          </p>
        </div>
      </footer>
    </div>
  );
}
