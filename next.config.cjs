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
  // Disable static optimization for dynamic routes
  trailingSlash: false,
  poweredByHeader: false,
  excludeDefaultMomentLocales: true,
  // Disable static generation for auth pages
  unstable_runtimeJS: true,
  // Force dynamic rendering for all pages
  unstable_allowDynamic: [
    "**/node_modules/lodash/**/*.js",
    "**/node_modules/@supabase/**/*.js",
    "**/node_modules/axios/**/*.js",
  ],
  // Disable automatic static optimization
  distDir: ".next",
  // Disable static optimization for auth pages
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },
  // Configure rewrites for API
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? "https://ngdi-api.vercel.app/api/:path*"
            : "http://localhost:3001/api/:path*",
      },
    ]
  },
}
