/** @type {import('next').NextConfig} */
const path = require("path")

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
    domains: ["ngdi.gov.ng", "example.com"], // Add your image domains here
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [],
    // Force dynamic rendering and skip static generation
    appDir: true,
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
    // Configure for middleware
    instrumentationHook: true,
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

    // Improve webpack caching to prevent errors
    config.cache = {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(".next/cache/webpack"),
      // Increase version when making changes to webpack config
      version: "1.0.0",
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
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.vercel-analytics.com https://*.vercel.app; frame-src 'self';",
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
  // Force dynamic rendering for auth pages
  unstable_runtimeJS: true,
  // Allow dynamic imports
  unstable_allowDynamic: [
    "**/node_modules/lodash/**/*.js",
    "**/node_modules/@supabase/**/*.js",
    "**/node_modules/axios/**/*.js",
  ],
  // Disable automatic static optimization
  distDir: ".next",
  // Configure compiler options
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },
  // Configure rewrites for API
  async rewrites() {
    return []
  },
  // Configure redirects
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/search/metadata",
        destination: "/search",
        permanent: true,
      },
      {
        source: "/search/metadata/:path*",
        destination: "/search/:path*",
        permanent: true,
      },
    ]
  },
  // Configure runtime settings
  serverRuntimeConfig: {
    // Auth pages should use Node.js runtime
    authPagesRuntime: "nodejs",
  },
  // Configure build settings
  onDemandEntries: {
    // Keep auth pages in memory
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
}
