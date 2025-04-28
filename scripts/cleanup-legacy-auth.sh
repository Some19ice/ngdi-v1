#!/bin/bash

# Script to remove legacy authentication code

echo "Removing legacy authentication files..."

# Web Package
echo "Cleaning up Web Package..."
rm -f packages/web/src/lib/auth.ts
rm -f packages/web/src/lib/auth-client.ts
rm -f packages/web/src/hooks/use-auth-session.ts
rm -f packages/web/src/lib/auth/auth-config.ts
rm -f packages/web/src/lib/auth/auth-types.ts
rm -f packages/web/src/lib/auth/server-auth.ts
rm -f packages/web/src/lib/auth-refresh.ts
rm -f packages/web/src/hooks/use-auth.ts
rm -f packages/web/src/hooks/use-auth-with-cache.ts
rm -f packages/web/src/lib/services/auth.service.ts

# API Package
echo "Cleaning up API Package..."
rm -f packages/api/src/middleware/auth.middleware.ts
rm -f packages/api/src/routes/auth.routes.ts
rm -f packages/api/src/services/auth.service.ts
rm -f packages/api/src/services/token-validation.service.ts

echo "Legacy authentication files removed successfully."
