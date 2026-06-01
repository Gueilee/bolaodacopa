import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  images: {
    // Permite imagens locais do public/ sem restrição de domínio
    unoptimized: false,
    remotePatterns: [],
  },
}

export default nextConfig
