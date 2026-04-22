import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { MobileNav, type MobileNavLink } from "@/app/_components/mobile-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  const navLinks: MobileNavLink[] = [
    { href: "/admin", label: "Visão geral" },
    { href: "/admin/lojas", label: "Lojas" },
    { href: "/admin/balconistas", label: "Balconistas" },
    { href: "/admin/produtos", label: "Produtos" },
    { href: "/admin/vendas", label: "Vendas" },
    { href: "/admin/cashbacks", label: "Cashbacks" },
    { href: "/admin/admins", label: "Admins" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100 dark:bg-zinc-950">
      <header
        className="sticky top-0 z-20 text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #2c0000 0%, #3f0000 60%, #1a0000 100%)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-off.svg"
                alt="Montana"
                width={160}
                height={52}
                className="h-7 w-auto"
              />
              <span className="hidden rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#2c0000] sm:inline-flex">
                Admin
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
            <p className="text-xs text-white/70">{admin.email}</p>
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
            userName={admin.name}
            userSubtitle={admin.email}
            panelBg="#1a0000"
            maxWidthClass="max-w-7xl"
          />
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
