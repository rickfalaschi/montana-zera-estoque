import Link from "next/link";
import { requireClerk } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { MobileNav, type MobileNavLink } from "@/app/_components/mobile-nav";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const clerk = await requireClerk();

  const navLinks: MobileNavLink[] = [
    { href: "/painel", label: "Meu painel" },
    { href: "/painel/perfil", label: "Meu perfil" },
    ...(clerk.isManager
      ? [
          { href: "/painel/vendas", label: "Vendas da loja" },
          { href: "/painel/balconistas", label: "Balconistas" },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100 dark:bg-zinc-950">
      <header
        className="sticky top-0 z-20 text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #4a1f0b 0%, #3a1508 60%, #2c0f04 100%)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/painel" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-off.svg"
                alt="Montana"
                width={160}
                height={52}
                className="h-7 w-auto"
              />
              <span className="hidden rounded-full bg-[#FFBE00] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#3f0000] lg:inline-flex">
                Zera Estoque
              </span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-white/80 transition hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="text-right text-xs">
              <p className="font-semibold text-white">{clerk.name}</p>
              <p className="text-white/60">
                {clerk.storeName}
                {clerk.isManager ? " · Gerente" : ""}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-white/30 bg-transparent px-4 py-1.5 text-xs font-semibold text-white/90 transition hover:border-white/50 hover:bg-white/10 hover:text-white"
              >
                Sair
              </button>
            </form>
          </div>

          <MobileNav
            links={navLinks}
            userName={clerk.name}
            userSubtitle={`${clerk.storeName}${clerk.isManager ? " · Gerente" : ""}`}
            panelBg="#2c0f04"
          />
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
