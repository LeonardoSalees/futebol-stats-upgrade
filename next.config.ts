// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora erros TS no build (não recomendado em prod)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig