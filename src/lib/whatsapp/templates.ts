/**
 * Templates de mensagem WhatsApp para o Bolão Copa 2026 | Vendemmia.
 *
 * Formatação Z-API:
 *   *negrito*, _itálico_, ~tachado~
 *   Emojis são suportados normalmente.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bolao.vendemmia.com.br'
const COPA_START = '11/Jun'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(target: Date): number {
  return Math.ceil((target.getTime() - Date.now()) / 86_400_000)
}

const COPA_DATE = new Date('2026-06-11T20:00:00Z')

// ─── Templates ────────────────────────────────────────────────────────────────

/**
 * Lembrete diário antes da Copa começar.
 * Enviado para usuários que não finalizaram os palpites.
 */
export function templateReminderDaily(params: {
  name:          string
  betCount:      number
  totalMatches:  number
  daysLeft?:     number
}): string {
  const days = params.daysLeft ?? daysUntil(COPA_DATE)
  const pct  = Math.round((params.betCount / params.totalMatches) * 100)

  const urgency =
    days <= 1 ? '🚨 *ÚLTIMO DIA!*' :
    days <= 3 ? '⚠️ *Faltam apenas ' + days + ' dias!*' :
    `⏳ Faltam *${days} dias* para a Copa começar.`

  return `⚽ *Bolão Copa 2026 | Vendemmia*

Olá, ${params.name.split(' ')[0]}! ${urgency}

Você registrou *${params.betCount} de ${params.totalMatches} palpites* (${pct}%).

🔒 Finalize agora — após confirmar, nenhum palpite pode ser alterado:
${APP_URL}/dashboard/palpites

_Acesso exclusivo Vendemmia · bolão.vendemmia.com.br_`
}

/**
 * Lembrete específico de jogo (enviado ~2h antes).
 * Enviado quando o usuário NÃO tem palpite para aquela partida.
 */
export function templateReminderMatch(params: {
  name:      string
  homeTeam:  string
  awayTeam:  string
  matchTime: string   // "16:00 (Brasília)"
  phase:     string   // "Grupo C"
}): string {
  return `⏰ *Em breve — ${params.homeTeam} × ${params.awayTeam}*

Olá, ${params.name.split(' ')[0]}! O jogo começa às *${params.matchTime}* e você ainda *não tem palpite* para esta partida.

📋 Fase: ${params.phase}

🎯 Faça seu palpite agora:
${APP_URL}/dashboard/jogos

_Bolão Copa 2026 | Vendemmia_`
}

/**
 * Resultado + pontuação recebida.
 * Enviado após o admin ou o sync automático pontuar o jogo.
 */
export function templateMatchResult(params: {
  name:           string
  homeTeam:       string
  awayTeam:       string
  homeScore:      number
  awayScore:      number
  predHome:       number | null
  predAway:       number | null
  points:         number
  breakdown:      string
  ranking:        number
  totalPoints:    number
  deptName?:      string
  deptRanking?:   number
}): string {
  const resultLine = `${params.homeTeam} *${params.homeScore}×${params.awayScore}* ${params.awayTeam}`

  let predLine = ''
  if (params.predHome !== null && params.predAway !== null) {
    predLine = `Seu palpite: *${params.predHome}×${params.predAway}*`
  } else {
    predLine = '_Você não tinha palpite para este jogo._'
  }

  const pointsLine =
    params.points === 10 ? `⚡ *Placar exato!* +${params.points} pontos` :
    params.points === 7  ? `🎯 *Vencedor e saldo!* +${params.points} pontos` :
    params.points === 5  ? `✅ *Vencedor correto!* +${params.points} pontos` :
    params.predHome !== null ? `❌ Resultado incorreto · 0 pontos` :
    `➖ Sem palpite · 0 pontos`

  const rankLine =
    `📊 Você está em *${params.ranking}º lugar* com *${params.totalPoints} pts*`

  const deptLine = params.deptName && params.deptRanking
    ? `\n🏢 Equipe *${params.deptName}*: ${params.deptRanking}º lugar por departamento`
    : ''

  return `⚽ *Resultado — ${resultLine}*

${predLine}
${pointsLine}

${rankLine}${deptLine}

${APP_URL}/dashboard

_Bolão Copa 2026 | Vendemmia_`
}

/**
 * Mensagem personalizada (envio manual pelo admin).
 */
export function templateCustom(params: {
  name:    string
  message: string
}): string {
  return `⚽ *Bolão Copa 2026 | Vendemmia*

Olá, ${params.name.split(' ')[0]}!

${params.message}

${APP_URL}/dashboard`
}

/**
 * Teste de conexão (enviado pelo admin para verificar a integração).
 */
export function templateTest(adminName: string): string {
  return `✅ *Teste de Conexão — Bolão Copa 2026*

Olá! Este é um teste de envio automático do sistema de notificações da Vendemmia.

Configurado por: ${adminName}
Horário: ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date())}

_Se você recebeu esta mensagem, o WhatsApp está configurado corretamente._`
}
