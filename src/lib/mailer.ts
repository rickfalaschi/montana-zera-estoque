import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function getTransporter(): Transporter {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST / SMTP_USER / SMTP_PASS não configurados.");
  }
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // implicit TLS em 465
    auth: { user, pass },
  });
  return cached;
}

function resetEmailHtml({
  name,
  url,
  kind,
}: {
  name: string;
  url: string;
  kind: "clerk" | "admin";
}): string {
  const bannerLabel =
    kind === "admin" ? "PAINEL ADMINISTRATIVO" : "ZERA ESTOQUE";
  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#18181b;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#a80000,#3f0000);color:#fff;padding:20px 28px;border-radius:14px 14px 0 0;text-align:center;">
      <div style="font-size:11px;letter-spacing:0.3em;font-weight:800;opacity:.9;">MONTANA QUÍMICA</div>
      <div style="font-size:13px;letter-spacing:0.25em;font-weight:800;color:#FFBE00;margin-top:6px;">${bannerLabel}</div>
    </div>
    <div style="background:#fff;padding:32px 28px;border:1px solid #e4e4e7;border-top:0;border-radius:0 0 14px 14px;">
      <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:-0.01em;">
        Redefinir sua senha
      </h1>
      <p style="margin:0 0 12px 0;color:#3f3f46;font-size:14px;line-height:1.5;">Olá, ${escapeHtml(
        name
      )}.</p>
      <p style="margin:0 0 16px 0;color:#3f3f46;font-size:14px;line-height:1.5;">
        Recebemos um pedido para redefinir a senha da sua conta na plataforma Zera Estoque.
        Clique no botão abaixo para criar uma nova senha. O link é válido por 1 hora.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${url}" style="background:#027D04;color:#fff;text-decoration:none;padding:14px 28px;border-radius:9999px;font-weight:800;display:inline-block;font-size:14px;letter-spacing:0.02em;">
          Redefinir senha
        </a>
      </div>
      <p style="margin:0 0 8px 0;color:#71717a;font-size:12px;line-height:1.5;">
        Se o botão não abrir, copie e cole este endereço no navegador:
      </p>
      <p style="margin:0 0 16px 0;color:#3f3f46;font-size:12px;word-break:break-all;">
        <a href="${url}" style="color:#A80000;">${url}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;" />
      <p style="margin:0;color:#71717a;font-size:11px;line-height:1.5;">
        Se você não solicitou este email, ignore esta mensagem — sua senha permanece como está.
      </p>
    </div>
    <p style="text-align:center;color:#a1a1aa;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-top:16px;">
      © ${new Date().getFullYear()} Montana Química
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail({
  to,
  name,
  url,
  kind,
}: {
  to: string;
  name: string;
  url: string;
  kind: "clerk" | "admin";
}): Promise<void> {
  const from =
    process.env.SMTP_FROM ||
    `"Montana Zera Estoque" <${process.env.SMTP_USER}>`;
  await getTransporter().sendMail({
    from,
    to,
    subject: "Redefinir sua senha — Zera Estoque",
    html: resetEmailHtml({ name, url, kind }),
    text: `Olá, ${name}. Clique no link para redefinir sua senha (válido por 1 hora): ${url}`,
  });
}
