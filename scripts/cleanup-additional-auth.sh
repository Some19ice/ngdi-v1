#!/bin/bash

# Script to remove additional unused auth-related files

echo "Removing additional unused auth-related files..."

# Web Package
echo "Cleaning up Web Package..."
rm -f packages/web/src/lib/auth/validation.ts
rm -f packages/web/src/lib/auth/token-service.ts
rm -f packages/web/src/lib/token-security.ts
rm -f packages/web/src/app/api/auth/sync-tokens/route.ts
rm -f packages/web/src/lib/auth/paths.ts

# API Package
echo "Cleaning up API Package..."
rm -f packages/api/src/utils/jwt.ts
rm -f packages/api/src/services/account-lockout.service.ts
rm -f packages/api/src/services/password-policy.service.simplified.ts

echo "Additional unused auth-related files removed successfully."
