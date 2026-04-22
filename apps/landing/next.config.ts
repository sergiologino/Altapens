import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // В docker/landing.Dockerfile зависимости ESLint для Next могут не подтянуться; линт — `npm run lint --workspace landing`
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_ESLINT_BUILD === '1',
  },
}

export default nextConfig
