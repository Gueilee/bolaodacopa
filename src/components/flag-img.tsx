'use client'

import { useState } from 'react'
import { getFlagUrl } from '@/lib/flags'

type Props = { country: string; size?: number }

export function FlagImg({ country, size = 28 }: Props) {
  const [failed, setFailed] = useState(false)
  const url = getFlagUrl(country, 40) // sempre w40 para máxima confiabilidade
  const w = Math.max(size, 24)
  const h = Math.round(w * 0.67)

  if (!url || failed) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: w, height: h, fontSize: Math.round(h * 0.95), lineHeight: 1, flexShrink: 0,
      }}>
        🏳
      </span>
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={country}
      width={w}
      height={h}
      style={{ objectFit: 'cover', borderRadius: 3, flexShrink: 0, display: 'block' }}
      onError={() => setFailed(true)}
    />
  )
}
