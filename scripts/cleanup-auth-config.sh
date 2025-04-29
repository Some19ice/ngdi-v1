#!/bin/bash

# Script to clean up old auth configuration files

echo "Cleaning up old auth configuration files..."

# Remove old configuration files
echo "Removing old configuration files..."
rm -f packages/web/src/lib/auth/supabase-config.ts
rm -f packages/web/src/lib/auth/config.ts
rm -f packages/api/src/config/supabase.config.ts

echo "Done!"
