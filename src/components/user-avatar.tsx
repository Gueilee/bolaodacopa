'use client'

import { useState } from 'react'

type Props = {
  name:       string
  avatarUrl?: string | null
  size?:      number   // px (default 32)
  bgColor?:   string
  textColor?: string
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function UserAvatar({ name, avatarUrl, size = 32, bgColor, textColor }: Props) {
  const [imgError, setImgError] = useState(false)

  const fontSize    = Math.max(9, Math.round(size * 0.36))
  const defaultBg   = bgColor   ?? '#f0ede8'
  const defaultText = textColor ?? '#5a5564'

  if (avatarUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        }}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize,
      background: defaultBg, color: defaultText,
      border: '1px solid rgba(0,0,0,0.08)',
      userSelect: 'none',
    }}>
      {getInitials(name)}
    </div>
  )
}
