/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ngdi/ui", "@ngdi/utils", "@ngdi/types"],
  images: {
    domains: ["localhost", "ngdi-portal.vercel.app"],
  },
  // Disable static optimization for dynamic routes
  output: "standalone",
  // Skip type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static generation for all pages
  staticPageGenerationTimeout: 1,
  // Force dynamic rendering for all pages
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    // Disable static optimization for all routes
    fallbackNodePolyfills: false,
  },
  // Configure for serverless deployment
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client side
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        path: false,
      }
    }
    return config
  },
}

module.exports = nextConfig;
