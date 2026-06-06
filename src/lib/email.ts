import nodemailer from 'nodemailer'

const MAILER_DSN  = process.env.MAILER_DSN  || ''
const MAILER_FROM = process.env.MAILER_FROM || ''

let smtpHost   = ''
let smtpPort   = 587
let smtpUser   = ''
let smtpPass   = ''
let smtpSecure = false

if (MAILER_DSN) {
  try {
    const parsed         = new URL(MAILER_DSN)
    const userParam      = parsed.searchParams.get('username')
    const passParam      = parsed.searchParams.get('password')
    const encryptionParam = parsed.searchParams.get('encryption')

    smtpUser = userParam || decodeURIComponent(parsed.username || '')
    smtpPass = passParam || decodeURIComponent(parsed.password || '')
    smtpHost = parsed.hostname || ''
    smtpPort = parsed.port
      ? parseInt(parsed.port, 10)
      : parsed.protocol === 'smtps:' ? 465 : 587

    const encryption = (encryptionParam || (smtpPort === 465 ? 'ssl' : 'tls')).toLowerCase()
    smtpSecure = encryption === 'ssl'
  } catch (e) {
    console.error('[email] Erro ao parsear MAILER_DSN:', e)
  }
}

if (!smtpHost) {
  smtpHost   = process.env.EMAIL_HOST  || ''
  smtpPort   = parseInt(process.env.EMAIL_PORT  || '587', 10)
  smtpUser   = process.env.EMAIL_USER  || ''
  smtpPass   = process.env.EMAIL_PASS  || ''
  smtpSecure = process.env.EMAIL_SECURE === 'true' || smtpPort === 465
}

const FROM = MAILER_FROM || process.env.EMAIL_FROM || 'Bolão Copa 2026 <onboarding@resend.dev>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://bolaodacopa.vendemmia.com.br'
const DEV_MODE = !smtpHost

function makeTransport() {
  if (DEV_MODE) return null
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser ? {
      user: smtpUser,
      pass: smtpPass,
    } : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  })
}

async function sendMail(to: string, subject: string, html: string) {
  const transport = makeTransport()
  if (!transport) {
    console.log(`\n📧 [DEV] E-mail para ${to}\n   Assunto: ${subject}\n`)
    return
  }
  await transport.sendMail({ from: FROM, to, subject, html })
}

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
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER — fundo sólido para compatibilidade máxima com clientes de e-mail -->
          <tr>
            <td bgcolor="#2a1a4e" style="background-color:#2a1a4e;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#01E18E;letter-spacing:0.18em;text-transform:uppercase;">
                Vendemmia Comércio Internacional
              </p>
              <div style="font-size:32px;margin:10px 0 6px;">⚽</div>
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;letter-spacing:-0.01em;">
                Bolão Copa do Mundo 2026
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.55);">
                Bolão Corporativo · Vendemmia
              </p>
            </td>
          </tr>

          <!-- BARRA NEON -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <div style="height:3px;background:#01E18E;"></div>
            </td>
          </tr>

          <!-- CORPO -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px;border-left:1px solid #e8e4df;border-right:1px solid #e8e4df;">
              <p style="margin:0 0 16px;font-size:17px;color:#1a1625;font-weight:700;">
                Olá, ${firstName}! 👋
              </p>
              <p style="margin:0 0 14px;font-size:14px;color:#4a4555;line-height:1.7;">
                Você foi convidado para participar do <strong style="color:#1a1625;">Bolão Corporativo da Copa do Mundo 2026</strong>
                da Vendemmia. Faça seus palpites, dispute no ranking individual e torça pelo seu departamento!
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#4a4555;line-height:1.7;">
                Para criar sua senha e acessar o sistema, clique no botão abaixo.
                O link é <strong style="color:#1a1625;">válido por 7 dias</strong> e de uso único.
              </p>

              <!-- BOTÃO CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td bgcolor="#422c76" style="background-color:#422c76;border-radius:12px;">
                    <a href="${link}" style="display:block;padding:16px 40px;font-size:16px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
                      🔐 &nbsp;Criar minha senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 6px;font-size:12px;color:#8a8490;">
                Se o botão não funcionar, copie e cole este link no navegador:
              </p>
              <p style="margin:0;font-size:11px;color:#422c76;word-break:break-all;">
                ${link}
              </p>
            </td>
          </tr>

          <!-- REGRAS CRÍTICAS DE PRAZO -->
          <tr>
            <td bgcolor="#fff5f7" style="background-color:#fff5f7;padding:28px 40px;border-left:1px solid #e8e4df;border-right:1px solid #e8e4df;border-top:3px solid #ff2f69;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:800;color:#cc1a50;text-transform:uppercase;letter-spacing:0.1em;">
                ⚠️ Regras Importantes — Leia antes de acessar
              </p>

              <!-- Regra 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;background:#ff2f69;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">⏰</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#1a1625;">
                      Prazo: 30 minutos antes de cada jogo
                    </p>
                    <p style="margin:0;font-size:13px;color:#4a4555;line-height:1.6;">
                      Os palpites de cada partida <strong>fecham automaticamente 30 minutos antes do apito inicial</strong>.
                      Se você não registrar até esse prazo, os campos ficam em branco e você
                      <strong style="color:#ff2f69;">não pontua naquele jogo</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Regra 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;background:#ff2f69;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">🔒</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#1a1625;">
                      Palpite salvo = permanente, sem alteração
                    </p>
                    <p style="margin:0;font-size:13px;color:#4a4555;line-height:1.6;">
                      Ao clicar em "Salvar" em uma partida, o palpite fica registrado e
                      <strong style="color:#ff2f69;">não pode ser alterado</strong>.
                      Confira bem os valores antes de salvar.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PALPITE FINAL -->
          <tr>
            <td bgcolor="#f8f6ff" style="background-color:#f8f6ff;padding:28px 40px;border-left:1px solid #e8e4df;border-right:1px solid #e8e4df;border-top:3px solid #422c76;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:800;color:#422c76;text-transform:uppercase;letter-spacing:0.1em;">
                🌟 Palpite Final — Obrigatório antes da Copa
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;background:#422c76;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">📅</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#1a1625;">
                      Deadline: 11 de junho de 2026 às 17h (Brasília)
                    </p>
                    <p style="margin:0;font-size:13px;color:#4a4555;line-height:1.6;">
                      Registre <strong>Campeão, Vice-Campeão e Artilheiro</strong> antes do início da Copa.
                      Quem não registrar perde os bônus. Uma vez salvo, <strong style="color:#422c76;">não pode ser alterado</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Bônus -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;border:1px solid #e0dbd5;">
                <tr>
                  <td style="padding:12px 16px;border-right:1px solid #f0ede8;text-align:center;">
                    <p style="margin:0;font-size:20px;">🏆</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:900;color:#422c76;">+50 pts</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#8a8490;">Campeão</p>
                  </td>
                  <td style="padding:12px 16px;border-right:1px solid #f0ede8;text-align:center;">
                    <p style="margin:0;font-size:20px;">⚽</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:900;color:#422c76;">+50 pts</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#8a8490;">Artilheiro</p>
                  </td>
                  <td style="padding:12px 16px;text-align:center;">
                    <p style="margin:0;font-size:20px;">🥈</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:900;color:#422c76;">+25 pts</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#8a8490;">Vice-Campeão</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PONTUAÇÃO POR PARTIDA -->
          <tr>
            <td style="background:#f9f7f5;padding:28px 40px;border:1px solid #e8e4df;border-top:none;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:800;color:#6b6672;text-transform:uppercase;letter-spacing:0.1em;">
                ⚽ Pontuação por partida
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;border-bottom:1px solid #f0ede8;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:20px;width:32px;">⚡</td>
                        <td style="font-size:13px;color:#4a4555;padding-left:8px;"><strong style="color:#1a1625;">Placar exato</strong> — Acertou os dois placares exatamente</td>
                        <td style="font-size:14px;font-weight:900;color:#01a866;text-align:right;white-space:nowrap;">10 pts</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;border-bottom:1px solid #f0ede8;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:20px;width:32px;">🎯</td>
                        <td style="font-size:13px;color:#4a4555;padding-left:8px;"><strong style="color:#1a1625;">Vencedor + Saldo</strong> — Acertou quem vence e a diferença de gols</td>
                        <td style="font-size:14px;font-weight:900;color:#d4a017;text-align:right;white-space:nowrap;">7 pts</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;border-bottom:1px solid #f0ede8;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:20px;width:32px;">✅</td>
                        <td style="font-size:13px;color:#4a4555;padding-left:8px;"><strong style="color:#1a1625;">Vencedor correto / Empate</strong> — Acertou quem vence ou que seria empate</td>
                        <td style="font-size:14px;font-weight:900;color:#2563eb;text-align:right;white-space:nowrap;">5 pts</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:20px;width:32px;">❌</td>
                        <td style="font-size:13px;color:#4a4555;padding-left:8px;"><strong style="color:#1a1625;">Resultado errado</strong> — Errou o vencedor</td>
                        <td style="font-size:14px;font-weight:900;color:#c4bfba;text-align:right;white-space:nowrap;">0 pts</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- REGRAS GERAIS -->
          <tr>
            <td style="background:#f0ede8;padding:24px 40px;border:1px solid #e8e4df;border-top:none;">
              <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6b6672;text-transform:uppercase;letter-spacing:0.1em;">
                📌 Lembre-se
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:4px 0;font-size:12px;color:#4a4555;line-height:1.6;">🔒 &nbsp;Ao salvar um jogo, o palpite não pode mais ser alterado.</td></tr>
                <tr><td style="padding:4px 0;font-size:12px;color:#4a4555;line-height:1.6;">📊 &nbsp;A pontuação é igual em todas as fases — grupo, oitavas, quartas, semi, final.</td></tr>
                <tr><td style="padding:4px 0;font-size:12px;color:#4a4555;line-height:1.6;">🏅 &nbsp;No caso de prorrogação ou pênaltis, o resultado de 90 minutos é o que conta.</td></tr>
                <tr><td style="padding:4px 0;font-size:12px;color:#4a4555;line-height:1.6;">🏆 &nbsp;O ranking é atualizado automaticamente após cada partida finalizada.</td></tr>
                <tr><td style="padding:4px 0;font-size:12px;color:#4a4555;line-height:1.6;">📱 &nbsp;Gerencie seus palpites com antecedência — não dependa de conexão de última hora.</td></tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td bgcolor="#2a1a4e" style="background-color:#2a1a4e;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;">
                Este e-mail foi enviado para <strong style="color:rgba(255,255,255,0.7);">${name}</strong> por ser colaborador(a) da Vendemmia.<br/>
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

// ─── Envio em lote ────────────────────────────────────────────────────────────

export async function sendBulkInviteEmails(
  users: { email: string; name: string; token: string }[],
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0, failed = 0
  const errors: string[] = []

  for (const u of users) {
    try {
      await sendMail(
        u.email,
        '⚽ Seu acesso ao Bolão Copa 2026 — Vendemmia',
        inviteTemplate(u.name, `${BASE_URL}/primeiro-acesso/${u.token}`)
      )
      sent++
    } catch (e) {
      failed++
      errors.push(`Erro para ${u.email}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return { sent, failed, errors }
}

// ─── Envio de convite individual ──────────────────────────────────────────────

export async function sendInviteEmail(
  to:    string,
  name:  string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const link = `${BASE_URL}/primeiro-acesso/${token}`

  try {
    await sendMail(
      to,
      '⚽ Seu acesso ao Bolão Copa 2026 — Vendemmia',
      inviteTemplate(name, link)
    )
    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}

// ─── E-mail de resultado direto (para testes) ────────────────────────────────

export async function sendDirectResultEmail(data: {
  to:        string
  name:      string
  homeTeam:  string
  awayTeam:  string
  homeScore: number
  awayScore: number
  predHome:  number
  predAway:  number
  points:    number
  total:     number
}): Promise<{ success: boolean; error?: string }> {
  try {
    await sendMail(
      data.to,
      `⚽ ${data.homeTeam} ${data.homeScore}×${data.awayScore} ${data.awayTeam} — Resultado do Bolão`,
      resultTemplate({ ...data, rankUrl: `${BASE_URL}/dashboard` }),
    )
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── Notificação de resultado ─────────────────────────────────────────────────

const POINTS_LABEL: Record<number, string> = {
  10: '⚡ Placar exato!',
  7:  '🎯 Vencedor + saldo!',
  5:  '✓ Vencedor certo!',
  0:  '✗ Sem pontos',
}

function resultTemplate(data: {
  name:      string
  homeTeam:  string
  awayTeam:  string
  homeScore: number
  awayScore: number
  predHome:  number
  predAway:  number
  points:    number
  total:     number
  rankUrl:   string
}): string {
  const firstName   = data.name.split(' ')[0]
  const ptLabel     = POINTS_LABEL[data.points] ?? `${data.points} pts`
  const ptColor     = data.points === 10 ? '#01a866' : data.points >= 5 ? '#d4a017' : '#8a8490'

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Resultado · Bolão Copa 2026</title></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0d0920,#1a0d36);padding:24px 28px;text-align:center">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.12em">Copa do Mundo 2026</p>
    <p style="margin:0;font-size:22px;font-weight:900;color:#faf9f5">⚽ Resultado do Jogo</p>
  </td></tr>

  <!-- Placar -->
  <tr><td style="padding:28px 28px 20px;text-align:center;border-bottom:1px solid #f0ede8">
    <p style="margin:0 0 16px;font-size:13px;color:#8a8490">Olá, <strong style="color:#1a1625">${firstName}</strong>!</p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="text-align:right;padding-right:12px"><span style="font-size:16px;font-weight:700;color:#1a1625">${data.homeTeam}</span></td>
      <td style="background:#f5f2ef;border-radius:10px;padding:10px 18px;white-space:nowrap;text-align:center">
        <span style="font-size:28px;font-weight:900;color:#1a1625">${data.homeScore}</span>
        <span style="font-size:14px;color:#c4bfba;margin:0 6px">×</span>
        <span style="font-size:28px;font-weight:900;color:#1a1625">${data.awayScore}</span>
      </td>
      <td style="text-align:left;padding-left:12px"><span style="font-size:16px;font-weight:700;color:#1a1625">${data.awayTeam}</span></td>
    </tr></table>
  </td></tr>

  <!-- Seu palpite -->
  <tr><td style="padding:20px 28px;border-bottom:1px solid #f0ede8">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#8a8490;text-transform:uppercase;letter-spacing:0.1em">Seu palpite</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#422c76">${data.predHome} × ${data.predAway}</p>
      </td>
      <td style="text-align:right">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#8a8490;text-transform:uppercase;letter-spacing:0.1em">Pontos</p>
        <p style="margin:0;font-size:22px;font-weight:900;color:${ptColor}">${data.points} pts</p>
        <p style="margin:2px 0 0;font-size:11px;color:${ptColor}">${ptLabel}</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Total -->
  <tr><td style="padding:16px 28px 24px;text-align:center">
    <p style="margin:0 0 4px;font-size:11px;color:#8a8490">Sua pontuação total</p>
    <p style="margin:0;font-size:28px;font-weight:900;color:#1a1625">${data.total} <span style="font-size:14px;font-weight:600;color:#8a8490">pts</span></p>
    <a href="${data.rankUrl}" style="display:inline-block;margin-top:14px;background:#422c76;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 24px;border-radius:10px">
      Ver minha posição no ranking →
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 28px;background:#faf9f5;text-align:center;border-top:1px solid #f0ede8">
    <p style="margin:0;font-size:11px;color:#aaa8b0">Bolão Copa 2026 · Vendemmia · <a href="${data.rankUrl}/perfil" style="color:#aaa8b0">Gerenciar notificações</a></p>
  </td></tr>

</table></td></tr></table>
</body></html>`
}

export type MatchResultPayload = {
  matchId:   string
  homeTeam:  string
  awayTeam:  string
  homeScore: number
  awayScore: number
}

export async function sendResultEmailsForMatch(payload: MatchResultPayload): Promise<void> {

  const { db }         = await import('@/lib/db')
  const { users, predictions } = await import('@/db/schema')
  const { eq, and }    = await import('drizzle-orm')

  // Busca todos os palpites pontuados do jogo + usuários com emailOptIn
  const rows = await db
    .select({
      userName:   users.name,
      userEmail:  users.email,
      totalPoints:users.totalPoints,
      predHome:   predictions.homeScore,
      predAway:   predictions.awayScore,
      points:     predictions.points,
    })
    .from(predictions)
    .innerJoin(users, eq(predictions.userId, users.id))
    .where(and(
      eq(predictions.matchId, payload.matchId),
      eq(predictions.isScored, true),
      eq(users.emailOptIn, true),
      eq(users.isActive, true),
    ))

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://bolaodacopa.vendemmia.com.br'

  for (const row of rows) {
    try {
      await sendMail(
        row.userEmail,
        `⚽ ${payload.homeTeam} ${payload.homeScore}×${payload.awayScore} ${payload.awayTeam} — Resultado do Bolão`,
        resultTemplate({
          name:      row.userName,
          homeTeam:  payload.homeTeam,
          awayTeam:  payload.awayTeam,
          homeScore: payload.homeScore,
          awayScore: payload.awayScore,
          predHome:  row.predHome,
          predAway:  row.predAway,
          points:    row.points,
          total:     row.totalPoints,
          rankUrl:   `${baseUrl}/dashboard`,
        }),
      )
    } catch (e) {
      console.error(`[email] Falha ao enviar resultado para ${row.userEmail}:`, e)
    }
  }
}
