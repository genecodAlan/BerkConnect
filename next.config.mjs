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
  // Allow mobile device testing from local network
  // This suppresses the cross-origin warning when accessing from your phone
  experimental: {
    // Use wildcard to allow any local network IP
    allowedDevOrigins: ['*'],
    outputFileTracingIncludes: {
      '/**': ['./node_modules/**/*.css'],
    },
  },
}

export default nextConfig
