import type { NextConfig } from 'next'

// Domínios permitidos para Server Actions (CSRF protection).
// Lê ALLOWED_ORIGINS do env (separados por vírgula) ou aceita qualquer host.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : undefined  // undefined = Next.js usa o host da requisição (comportamento padrão seguro)

const nextConfig: NextConfig = {
  experimental: {
    serverActions: allowedOrigins ? { allowedOrigins } : {},
  },
  images: {
    unoptimized: true,   // compatível com Azure e qualquer host não-Vercel
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
}

export default nextConfig
