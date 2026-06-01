'use client'

import { useState } from 'react'

export function HrExportButton() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleExport() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/export-rh')
      if (!res.ok) throw new Error(await res.text())

      const blob     = await res.blob()
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      a.href         = url
      a.download     = `bolao-copa-2026-rh-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 btn-primary text-sm py-2.5 px-5"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Gerando CSV...
          </>
        ) : (
          <>↓ Exportar Relatório CSV</>
        )}
      </button>
      {error && <p className="text-brand-pink text-xs">{error}</p>}
    </div>
  )
}
