/**
 * Declarações TypeScript para os custom elements da API-Sports Widgets.
 * Docs: https://api-sports.io/documentation/widgets/v3
 */

interface ApiSportsWidgetHTMLAttributes {
  /** Tipo do widget */
  'data-type':     'config' | 'standings' | 'games' | 'game' | 'league' | 'transfers'
  /** API Key (exposta no HTML — configure restrição de domínio no dashboard) */
  'data-key'?:     string
  /** Esporte */
  'data-sport'?:   'football'
  /** Tema visual */
  'data-theme'?:   'dark' | 'white' | 'grey' | 'blue'
  /** Idioma */
  'data-lang'?:    string
  /** ID da liga (Copa 2026 = 1) */
  'data-league'?:  string
  /** Temporada (Copa 2026 = 2026) */
  'data-season'?:  string
  /** ID do fixture (para widget tipo "game") */
  'data-id'?:      string
  /** Intervalo de atualização automática em segundos */
  'data-refresh'?: string
  /** Seletor CSS do elemento onde clicar abre detalhes */
  'data-target-game'?: string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'api-sports-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & ApiSportsWidgetHTMLAttributes,
        HTMLElement
      >
    }
  }
}

export {}
