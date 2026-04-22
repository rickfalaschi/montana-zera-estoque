import Link from "next/link";
import Image from "next/image";

type Variant = "clerk" | "admin";

export function AuthFrame({
  variant = "clerk",
  title,
  subtitle,
  children,
  footer,
}: {
  variant?: Variant;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const bg =
    variant === "admin"
      ? "radial-gradient(ellipse at 50% 20%, #7a0000 0%, #3f0000 55%, #1a0000 100%)"
      : "radial-gradient(ellipse at 50% 20%, #a80000 0%, #7a0000 55%, #3f0000 100%)";

  return (
    <div
      className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6 py-10"
      style={{ backgroundImage: bg }}
    >
      {/* Sunburst rays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 0deg at 50% 30%, rgba(255,255,255,0.18) 0deg 2deg, transparent 2deg 10deg)",
        }}
      />
      {/* Dot patterns */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 2px, transparent 2px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,190,0,0.9) 2px, transparent 2px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative flex w-full max-w-md flex-col items-center">
        {/* Campaign logo */}
        <Image
          src="/images/logo.png"
          alt="Operação Zera Estoque"
          width={700}
          height={640}
          priority
          className="w-56 sm:w-64 md:w-72 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
        />

        {variant === "admin" && (
          <span className="mt-4 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#2c0000]">
            Admin
          </span>
        )}

        {/* White form card */}
        <div className="mt-6 w-full rounded-2xl bg-white p-8 shadow-2xl shadow-black/30 sm:p-10">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900"
          >
            ← Voltar
          </Link>
          <h1 className="mt-3 text-2xl font-black uppercase leading-tight tracking-tight text-zinc-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-zinc-600">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 border-t border-zinc-200 pt-5 text-sm text-zinc-600">
              {footer}
            </div>
          )}
        </div>

        <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/60">
          © {new Date().getFullYear()} Montana Química
        </p>
      </div>
    </div>
  );
}
