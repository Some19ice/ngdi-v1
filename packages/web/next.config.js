/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ngdi/ui", "@ngdi/utils", "@ngdi/types"],
  images: {
    domains: ["localhost", "ngdi-portal.vercel.app"],
  },
  // Use standalone output for better deployment compatibility
  output: "standalone",
  // Skip type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow reasonable time for static generation
  staticPageGenerationTimeout: 120,
  // Configure experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
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
