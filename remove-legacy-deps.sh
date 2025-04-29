#!/bin/bash

# Script to remove unused dependencies
# WARNING: This may break your build if the dependencies are still in use.

echo "Removing unused authentication dependencies..."

# Ask for confirmation
read -p "This will remove unused dependencies. Are you sure? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled"
  exit 1
fi

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
