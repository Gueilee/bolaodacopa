'use client'

import { useState } from 'react'

type ExportItem = {
  id:          string
  icon:        string
  title:       string
  description: string
  badge:       string
  url:         string
  accent:      'purple' | 'neon' | 'pink' | 'white'
  isPdf?:      boolean
}

type Props = {
  stats: {
    totalUsers:    number
    lockedUsers:   number
    totalDepts:    number
    pendingCount:  number
  }
}

export function ExportCenter({ stats }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  const items: ExportItem[] = [
    {
      id:          'pdf',
      icon:        '📄',
      title:       'Relatório Completo',
      description: 'PDF com capa, ranking individual e por departamento. Pronto para apresentação à diretoria.',
      badge:       'PDF',
      url:         '/api/admin/export-pdf',
      accent:      'purple',
      isPdf:       true,
    },
    {
      id:          'csv-ranking',
      icon:        '🏆',
      title:       'Ranking Individual',
      description: `Classificação completa dos ${stats.totalUsers} participantes com pontos, placares exatos e status de finalização.`,
      badge:       'CSV',
      url:         '/api/admin/export-csv?type=ranking',
      accent:      'neon',
    },
    {
      id:          'csv-dept',
      icon:        '🏢',
      title:       'Ranking por Departamento',
      description: `Desempenho dos ${stats.totalDepts} departamentos: média de pontos, taxa de adesão, pontuação máxima.`,
      badge:       'CSV',
      url:         '/api/admin/export-csv?type=departamentos',
      accent:      'neon',
    },
    {
      id:          'csv-completo',
      icon:        '📊',
      title:       'Participação Completa',
      description: `Todos os ${stats.totalUsers} colaboradores com todos os indicadores. Ideal para análise no Excel.`,
      badge:       'CSV',
      url:         '/api/admin/export-csv?type=completo',
      accent:      'white',
    },
    {
      id:          'csv-pendentes',
      icon:        '⚠️',
      title:       'Pendentes sem Registro',
      description: `${stats.pendingCount} colaboradores que ainda não finalizaram. Use para envio de lembretes.`,
      badge:       'CSV',
      url:         '/api/admin/export-csv?type=pendentes',
      accent:      'pink',
    },
  ]

  async function handleDownload(item: ExportItem) {
    setLoading(item.id)
    setErrors((prev) => ({ ...prev, [item.id]: '' }))

    try {
      const res = await fetch(item.url)
      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url

      const disposition = res.headers.get('content-disposition') ?? ''
      const match       = disposition.match(/filename="([^"]+)"/)
      a.download        = match?.[1] ?? (item.isPdf ? 'relatorio.pdf' : 'relatorio.csv')

      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [item.id]: err instanceof Error ? err.message : 'Erro ao baixar',
      }))
    } finally {
      setLoading(null)
    }
  }

  const accentClasses: Record<ExportItem['accent'], { border: string; badge: string; btn: string }> = {
    purple: {
      border: 'border-brand-purple/30 hover:border-brand-purple/60',
      badge:  'bg-brand-purple text-white',
      btn:    'btn-primary',
    },
    neon: {
      border: 'border-brand-neon/20 hover:border-brand-neon/40',
      badge:  'bg-brand-neon/20 text-brand-neon border border-brand-neon/30',
      btn:    'bg-brand-neon/10 hover:bg-brand-neon/20 border border-brand-neon/30 text-brand-neon font-semibold py-2 px-4 rounded-xl text-sm transition-all',
    },
    pink: {
      border: 'border-brand-pink/20 hover:border-brand-pink/40',
      badge:  'bg-brand-pink/15 text-brand-pink border border-brand-pink/25',
      btn:    'bg-brand-pink/10 hover:bg-brand-pink/20 border border-brand-pink/30 text-brand-pink font-semibold py-2 px-4 rounded-xl text-sm transition-all',
    },
    white: {
      border: 'border-[#e8e4df] hover:border-[#c4bfba]',
      badge:  'bg-[#f5f2ef] text-[#6b6672] border border-[#e0dbd5]',
      btn:    'border border-[#d0cbc5] hover:border-[#b0aba5] text-[#4a4555] font-semibold py-2 px-4 rounded-xl text-sm transition-all bg-[#f5f2ef] hover:bg-[#ede9e4]',
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const acc      = accentClasses[item.accent]
        const isLoading = loading === item.id
        const error    = errors[item.id]

        return (
          <div
            key={item.id}
            className={`card p-5 flex flex-col gap-4 border transition-all ${acc.border} ${
              item.id === 'pdf' ? 'md:col-span-2' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold" style={{ color: '#1a1625' }}>{item.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${acc.badge}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#8a8490' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Preview conteúdo (PDF apenas) */}
            {item.isPdf && (
              <div className="grid grid-cols-5 gap-2 py-2 border-y" style={{ borderColor: '#e8e4df' }}>
                {[
                  { label: 'Capa',               icon: '📋' },
                  { label: 'Ranking unidades',   icon: '📍' },
                  { label: 'Ranking dept.',      icon: '🏢' },
                  { label: 'Ranking individual', icon: '🏆' },
                  { label: 'Branding',           icon: '🎨' },
                ].map((f) => (
                  <div key={f.label} className="text-center">
                    <p className="text-base mb-1">{f.icon}</p>
                    <p className="text-[10px]" style={{ color: '#aaa8b0' }}>{f.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-brand-pink text-xs bg-brand-pink/10 border border-brand-pink/20 rounded-lg px-3 py-2">
                ✗ {error}
              </p>
            )}

            {/* Download button */}
            <button
              onClick={() => handleDownload(item)}
              disabled={isLoading}
              className={`${acc.btn} flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed self-start`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Gerando {item.badge}...
                </>
              ) : (
                <>↓ Baixar {item.badge}</>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
