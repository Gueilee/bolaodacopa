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
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.blob.core.windows.net' },  // Azure Blob (futuro)
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
}

export default nextConfig
