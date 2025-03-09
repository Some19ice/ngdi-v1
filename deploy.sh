#!/bin/bash

# Exit on error
set -e

echo "Deploying NGDI Portal..."

# Build the API server
echo "Building API server..."
cd packages/api
npm run build
cd ../..

# Build the Next.js frontend
echo "Building Next.js frontend..."
npm run build:web

# Deploy the API server
echo "Deploying API server..."
cd packages/api
vercel --prod
cd ../..

# Deploy the Next.js frontend
echo "Deploying Next.js frontend..."
vercel --prod

echo "Deployment complete!" 