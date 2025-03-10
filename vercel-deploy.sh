#!/bin/bash

# Exit on error
set -e

echo "Preparing for Vercel deployment..."

# Clean up any previous builds
echo "Cleaning up previous builds..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "Installing dependencies..."
npm ci

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the Next.js app
echo "Building Next.js app..."
NEXT_PUBLIC_VERCEL_ENV=production npm run build:web

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!" 