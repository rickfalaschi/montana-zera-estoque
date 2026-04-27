export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length !== 11) return value;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length !== 14) return value;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatPhone(value: string): string {
  const d = onlyDigits(value);
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return value;
}

export function formatCep(value: string): string {
  const d = onlyDigits(value);
  if (d.length !== 8) return value;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatPoints(value: number | null | undefined): string {
  if (value == null) return "0";
  // Inteiro mostra sem decimais; meio ponto mostra com 1 casa.
  return value % 1 === 0 ? String(value) : value.toFixed(1).replace(".", ",");
}

export function formatBirthDate(value: string | null | undefined): string {
  if (!value) return "";
  // Aceita "YYYY-MM-DD" (formato armazenado)
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatBRLFromReais(reais: number): string {
  return reais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function monthName(month: number): string {
  return MONTHS[month - 1] ?? String(month);
}

export function formatPeriod(year: number, month: number): string {
  const name = monthName(month);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

export function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
