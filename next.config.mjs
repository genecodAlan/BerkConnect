/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: ['*'],
  },
  // Ensure proper bundling for serverless functions
  serverExternalPackages: ['pg', 'pg-native'],
}

export default nextConfig
