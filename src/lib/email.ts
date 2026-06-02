import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'Bolão Copa 2026 <onboarding@resend.dev>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://bolaodacopa.vendemmia.com.br'

// ─── Template HTML do e-mail de convite ───────────────────────────────────────

function inviteTemplate(name: string, link: string): string {
  const firstName = name.split(' ')[0]
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bolão Copa 2026 — Seu acesso chegou!</title>
</head>
<body style="margin:0;padding:0;background:#f5f2ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ef;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo / Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#422c76 0%,#2a1a4e 100%);border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#01E18E;letter-spacing:0.15em;text-transform:uppercase;">
                Vendemmia Comércio Internacional
              </p>
              <h1 style="margin:12px 0 0;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">
                ⚽ Bolão Copa do Mundo 2026
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e8e4df;border-right:1px solid #e8e4df;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1625;font-weight:600;">
                Olá, ${firstName}! 👋
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#4a4555;line-height:1.6;">
                Você foi convidado para participar do <strong>Bolão Corporativo da Copa do Mundo 2026</strong>
                da Vendemmia. Faça seus palpites, dispute no ranking individual e torça pelo seu departamento!
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#4a4555;line-height:1.6;">
                Para criar sua senha e acessar o sistema, clique no botão abaixo.
                O link é <strong>válido por 7 dias</strong> e de uso único.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#422c76;border-radius:12px;padding:0;">
                    <a href="${link}" style="display:block;padding:16px 36px;font-size:16px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
                      🔐 &nbsp;Criar minha senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0 0 8px;font-size:12px;color:#8a8490;">
                Se o botão não funcionar, copie e cole este link no navegador:
              </p>
              <p style="margin:0;font-size:11px;color:#422c76;word-break:break-all;">
                ${link}
              </p>
            </td>
          </tr>

          <!-- Regras rápidas -->
          <tr>
            <td style="background:#f9f7f5;padding:28px 40px;border:1px solid #e8e4df;border-top:none;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#6b6672;text-transform:uppercase;letter-spacing:0.1em;">
                Como funciona a pontuação
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#4a4555;">⚡ Placar exato</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:800;color:#1a1625;text-align:right;">10 pts</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#4a4555;">🎯 Vencedor + saldo corretos</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:800;color:#1a1625;text-align:right;">7 pts</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#4a4555;">✓ Vencedor correto</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:800;color:#1a1625;text-align:right;">5 pts</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#4a4555;">✗ Resultado errado</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:800;color:#c4bfba;text-align:right;">0 pts</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0ede8;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border:1px solid #e8e4df;border-top:none;">
              <p style="margin:0;font-size:11px;color:#aaa8b0;line-height:1.5;">
                Este e-mail foi enviado para <strong>${name}</strong> por ser colaborador(a) da Vendemmia.<br/>
                Dúvidas? Fale com o RH ou o organizador do bolão.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Envio de convite ─────────────────────────────────────────────────────────

export async function sendInviteEmail(
  to:    string,
  name:  string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const link = `${BASE_URL}/primeiro-acesso/${token}`

  try {
    const { error } = await resend.emails.send({
      from:    FROM,
      to,
      subject: '⚽ Seu acesso ao Bolão Copa 2026 — Vendemmia',
      html:    inviteTemplate(name, link),
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}
