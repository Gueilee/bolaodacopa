/**
 * Componentes de widgets API-Sports para Copa 2026.
 *
 * Funcionam com plano FREE — não consomem o limite de 100 req/dia.
 * Os widgets carregam dados em tempo real diretamente do CDN da API-Sports.
 *
 * ⚠  Segurança: a chave API fica visível no HTML do cliente.
 *    Configure restrição de domínio em: https://dashboard.api-sports.io
 *    (Settings → API Key → Allowed domains)
 *
 * Uso:
 *   <CopaFixturesToday />          — jogos do dia com placar ao vivo
 *   <CopaGroupStandings />         — classificação dos 12 grupos
 *   <CopaLeagueOverview />         — visão geral (fixtures + standings)
 *   <CopaGameDetail fixtureId={x} /> — detalhes de um jogo específico
 */

'use client'

import Script from 'next/script'
import '@/types/api-sports-widgets'

const API_KEY   = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY ?? ''
const LEAGUE    = '1'
const SEASON    = '2026'
const LANG      = 'pt'
const THEME     = 'dark'

// ─── Script global ────────────────────────────────────────────────────────────
// Carregado uma vez; os widgets custom elements registram-se automaticamente.

export function ApiSportsScript() {
  return (
    <Script
      src="https://widgets.api-sports.io/3.1.0/widgets.js"
      strategy="lazyOnload"
      type="module"
    />
  )
}

// ─── Configuração global do widget ───────────────────────────────────────────
// Deve aparecer UMA VEZ na página antes dos demais widgets.

function WidgetConfig() {
  return (
    <api-sports-widget
      data-type="config"
      data-key={API_KEY}
      data-sport="football"
      data-theme={THEME}
      data-lang={LANG}
    />
  )
}

// ─── Jogos do dia (com placar ao vivo) ───────────────────────────────────────

export function CopaFixturesToday() {
  if (!API_KEY) return <WidgetPlaceholder label="Jogos do dia" reason="NEXT_PUBLIC_API_FOOTBALL_KEY não configurada" />

  return (
    <div className="copa-widget-container">
      <WidgetConfig />
      <api-sports-widget
        data-type="games"
        data-league={LEAGUE}
        data-season={SEASON}
        data-refresh="60"
      />
      <WidgetStyles />
    </div>
  )
}

// ─── Classificação dos grupos ────────────────────────────────────────────────

export function CopaGroupStandings() {
  if (!API_KEY) return <WidgetPlaceholder label="Classificação dos grupos" reason="NEXT_PUBLIC_API_FOOTBALL_KEY não configurada" />

  return (
    <div className="copa-widget-container">
      <WidgetConfig />
      <api-sports-widget
        data-type="standings"
        data-league={LEAGUE}
        data-season={SEASON}
      />
      <WidgetStyles />
    </div>
  )
}

// ─── Visão geral da liga (fixtures + standings) ──────────────────────────────

export function CopaLeagueOverview() {
  if (!API_KEY) return <WidgetPlaceholder label="Copa 2026 — Visão Geral" reason="NEXT_PUBLIC_API_FOOTBALL_KEY não configurada" />

  return (
    <div className="copa-widget-container">
      <WidgetConfig />
      <api-sports-widget
        data-type="league"
        data-league={LEAGUE}
        data-season={SEASON}
        data-refresh="60"
      />
      <WidgetStyles />
    </div>
  )
}

// ─── Detalhes de uma partida ─────────────────────────────────────────────────

export function CopaGameDetail({ fixtureId }: { fixtureId: number }) {
  if (!API_KEY) return <WidgetPlaceholder label={`Jogo #${fixtureId}`} reason="NEXT_PUBLIC_API_FOOTBALL_KEY não configurada" />

  return (
    <div className="copa-widget-container">
      <WidgetConfig />
      <api-sports-widget
        data-type="game"
        data-id={String(fixtureId)}
        data-refresh="30"
      />
      <WidgetStyles />
    </div>
  )
}

// ─── Placeholder para quando a key não está configurada ──────────────────────

function WidgetPlaceholder({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-white/15 text-center gap-2">
      <p className="text-white/40 text-sm font-medium">{label}</p>
      <p className="text-white/20 text-xs">{reason}</p>
      <p className="text-white/20 text-xs">
        Adicione <code className="text-brand-neon/70">NEXT_PUBLIC_API_FOOTBALL_KEY</code> no .env.local
      </p>
    </div>
  )
}

// ─── CSS de adaptação visual ─────────────────────────────────────────────────
// Injeta overrides mínimos para integrar o widget ao design do bolão.
// O widget usa shadow DOM, então apenas variáveis CSS conseguem penetrar.

function WidgetStyles() {
  return (
    <style>{`
      .copa-widget-container {
        border-radius: 1rem;
        overflow: hidden;
        width: 100%;
      }
      .copa-widget-container api-sports-widget {
        display: block;
        width: 100%;
      }
    `}</style>
  )
}
