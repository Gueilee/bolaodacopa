'use client'

import { getFlagUrl } from '@/lib/flags'

type Props = {
  teamName: string
  size?: number       // px width (default 32)
  className?: string
}

export function TeamFlag({ teamName, size = 32, className = '' }: Props) {
  const url = getFlagUrl(teamName, size <= 24 ? 20 : size <= 40 ? 40 : 80)
  if (!url) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`Bandeira ${teamName}`}
      width={size}
      height={Math.round(size * 0.67)}
      className={className}
      style={{
        width: size,
        height: 'auto',
        borderRadius: 3,
        objectFit: 'cover',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        flexShrink: 0,
      }}
    />
  )
}
