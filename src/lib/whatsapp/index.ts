/**
 * Cliente WhatsApp — Z-API (https://z-api.io)
 *
 * Setup:
 *  1. Crie uma instância em https://app.z-api.io
 *  2. Escaneie o QR Code com um número WhatsApp (pessoal ou Business)
 *  3. Copie Instance ID e Instance Token para o .env
 *
 * Variáveis necessárias:
 *   ZAPI_INSTANCE_ID   — ex: "3A1B2C3D4E5F6G7H"
 *   ZAPI_INSTANCE_TOKEN — ex: "A1B2C3D4E5F6G7H8I9J0"
 *   ZAPI_CLIENT_TOKEN  — (opcional) header de segurança extra
 *
 * Formato do número: apenas dígitos, com DDI+DDD
 *   Brasil: 5511999999999  (55 = BR, 11 = DDD, 999999999 = número)
 */

// ─── Normalização de número ───────────────────────────────────────────────────

/**
 * Converte qualquer formato de telefone BR para o padrão Z-API.
 * Input aceitável: "(11) 9 9999-9999", "+55 11 99999-9999", "11999999999"
 * Output: "5511999999999"
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  // Já tem código do país (55)
  if (digits.startsWith('55') && digits.length >= 12) return digits

  // Só os dígitos brasileiros (DDD + número)
  if (digits.length === 10 || digits.length === 11) return `55${digits}`

  return digits
}

export function isValidBrPhone(raw: string): boolean {
  const normalized = normalizePhone(raw)
  return /^55\d{10,11}$/.test(normalized)
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type SendResult = {
  success:    boolean
  messageId?: string
  error?:     string
}

export type ConnectionStatus = {
  connected:           boolean
  smartphoneConnected: boolean
  error?:              string
}

// ─── Cliente Z-API ────────────────────────────────────────────────────────────

export class ZApiClient {
  private readonly base: string
  private readonly headers: HeadersInit

  constructor() {
    const id    = process.env.ZAPI_INSTANCE_ID
    const token = process.env.ZAPI_INSTANCE_TOKEN

    if (!id || !token) {
      throw new Error('ZAPI_INSTANCE_ID e ZAPI_INSTANCE_TOKEN não configurados.')
    }

    this.base = `https://api.z-api.io/instances/${id}/token/${token}`
    this.headers = {
      'Content-Type': 'application/json',
      ...(process.env.ZAPI_CLIENT_TOKEN
        ? { 'Client-Token': process.env.ZAPI_CLIENT_TOKEN }
        : {}),
    }
  }

  async sendText(phone: string, message: string): Promise<SendResult> {
    const normalized = normalizePhone(phone)

    try {
      const res = await fetch(`${this.base}/send-text`, {
        method:  'POST',
        headers: this.headers,
        body:    JSON.stringify({ phone: normalized, message }),
      })

      const body = await res.json() as { messageId?: string; error?: string; message?: string }

      if (!res.ok) {
        return { success: false, error: body.error ?? body.message ?? `HTTP ${res.status}` }
      }

      return { success: true, messageId: body.messageId }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  async getStatus(): Promise<ConnectionStatus> {
    try {
      const res  = await fetch(`${this.base}/status`, { headers: this.headers })
      const body = await res.json() as { value?: { connected: boolean; smartphoneConnected: boolean } }

      if (!res.ok || !body.value) {
        return { connected: false, smartphoneConnected: false, error: `HTTP ${res.status}` }
      }

      return {
        connected:           body.value.connected ?? false,
        smartphoneConnected: body.value.smartphoneConnected ?? false,
      }
    } catch (err) {
      return {
        connected:           false,
        smartphoneConnected: false,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }
}

// ─── Singleton lazy (evita re-instanciar a cada request) ──────────────────────

let _client: ZApiClient | null = null

export function getWhatsAppClient(): ZApiClient | null {
  if (!process.env.ZAPI_INSTANCE_ID || !process.env.ZAPI_INSTANCE_TOKEN) return null
  if (!_client) _client = new ZApiClient()
  return _client
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_INSTANCE_TOKEN)
}
