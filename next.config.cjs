/** @type {import('next').NextConfig} */
module.exports = {
  output: "standalone",
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "ngdi-v1.vercel.app"],
      bodySizeLimit: "2mb",
    },
  },
  optimizeFonts: true,
}
