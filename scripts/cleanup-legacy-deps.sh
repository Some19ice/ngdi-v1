#!/bin/bash

# Script to remove unused dependencies

echo "Removing unused dependencies..."

# Web Package
echo "Cleaning up Web Package dependencies..."
cd packages/web
npm uninstall jsonwebtoken bcryptjs jose axios --legacy-peer-deps
cd ../..

# API Package
echo "Cleaning up API Package dependencies..."
cd packages/api
npm uninstall jsonwebtoken bcryptjs jose --legacy-peer-deps
cd ../..

echo "Unused dependencies removed successfully."
