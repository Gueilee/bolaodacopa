import type { NextConfig } from 'next'

// Domínios permitidos para Server Actions (CSRF protection).
// Lê ALLOWED_ORIGINS do env (separados por vírgula) ou aceita qualquer host.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : undefined  // undefined = Next.js usa o host da requisição (comportamento padrão seguro)

// Extensões de arquivos estáticos que serão servidos via rota API
// em ambientes Docker/standalone onde public/ não é exposta automaticamente.
const STATIC_EXT = 'png|jpg|jpeg|gif|webp|ico|svg|mp4|webm'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: allowedOrigins ? { allowedOrigins } : {},
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  async rewrites() {
    return {
      // beforeFiles: roda antes de qualquer resolução de arquivo/rota.
      // Redireciona pedidos de imagens/vídeos para a rota API que lê
      // do filesystem — funciona em qualquer ambiente (Azure, Docker, Vercel).
      beforeFiles: [
        {
          source: `/:file((?!api|_next|favicon)[^/]+\\.(?:${STATIC_EXT}))`,
          destination: '/api/static/:file',
        },
        {
          source: `/uploads/:path*`,
          destination: '/api/static/uploads/:path*',
        },
      ],
    }
  },
}

export default nextConfig
