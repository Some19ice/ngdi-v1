/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ngdi/ui', '@ngdi/utils', '@ngdi/types'],
  images: {
    domains: ['localhost', 'ngdi-portal.vercel.app'],
  },
};

module.exports = nextConfig;
