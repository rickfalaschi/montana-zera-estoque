// Brand palette (mantido em sincronia com globals.css @theme)
export const brand = {
  red: "#A80000",
  redDark: "#5a0000",
  redDeep: "#2c0000",
  green: "#027D04",
  greenDark: "#015701",
  yellow: "#FFBE00",
  brown: "#4a1f0b",
};

// Buttons — rounded-lg, sem sombra, hover em cor sólida
export const buttonPrimary =
  "inline-flex h-10 items-center justify-center rounded-lg bg-[#027D04] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#015701] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#027D04]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900";
export const buttonSecondary =
  "inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 px-5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2";
export const buttonDanger =
  "inline-flex h-10 items-center justify-center rounded-lg bg-[#A80000] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#7a0000] disabled:opacity-50";
export const buttonGhost =
  "inline-flex h-10 items-center justify-center rounded-lg border border-white/20 bg-transparent px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10";

// Form fields
export const inputClass =
  "w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-[#027D04] focus:outline-none focus:ring-4 focus:ring-[#027D04]/12 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100";
export const labelClass =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5";

// Cards — sem border, sem shadow; contraste via bg (page é zinc-100)
export const card = "rounded-2xl bg-white p-6 dark:bg-zinc-900";
export const cardMuted =
  "rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-950/50";
export const cardAccent =
  "rounded-2xl bg-gradient-to-br from-white via-white to-[#FFBE00]/15 p-6 dark:from-zinc-900 dark:via-zinc-900 dark:to-[#FFBE00]/10";

// Tables — padding generoso, divisor sutil
export const tableClass = "w-full text-sm";
export const thClass =
  "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500";
export const tdClass = "px-4 py-3.5 text-zinc-800 dark:text-zinc-100";
export const trClass =
  "border-b border-zinc-100 last:border-b-0 dark:border-zinc-800/60";

// Status badges
export const badgeBase =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
export const badgeSuccess = `${badgeBase} bg-[#027D04]/10 text-[#015701] dark:bg-[#027D04]/20 dark:text-[#7cd77e]`;
export const badgeWarning = `${badgeBase} bg-[#FFBE00]/20 text-[#7a5a00] dark:bg-[#FFBE00]/15 dark:text-[#FFBE00]`;
export const badgeDanger = `${badgeBase} bg-[#A80000]/10 text-[#A80000] dark:bg-[#A80000]/20 dark:text-[#ff8b8b]`;
export const badgeNeutral = `${badgeBase} bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200`;
export const badgeBrand = `${badgeBase} bg-[#FFBE00] text-[#3f0000]`;

// Sections / titles — menos "gritado"
export const sectionTitle =
  "text-base font-bold text-zinc-900 dark:text-white";
export const eyebrow =
  "inline-flex items-center rounded-full bg-[#FFBE00]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#7a5a00] dark:bg-[#FFBE00]/20 dark:text-[#FFBE00]";
