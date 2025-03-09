/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [], // Add your image domains here
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [],
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
  // Security headers
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
        },
      ],
    },
  ],
  // Configure for serverless deployment
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  // Use standalone output for Vercel serverless deployment
  output: "standalone",
  // Force dynamic rendering for all pages
  trailingSlash: false,
  // Disable static optimization
  staticPageGenerationTimeout: 1000,
  // Generate a consistent build ID
  generateBuildId: async () => {
    return "build-id"
  },
  // Force all pages to be server-side rendered
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },
  // Disable static exports for pages using dynamic features
  distDir: ".next",
}
