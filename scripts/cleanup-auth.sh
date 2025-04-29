#!/bin/bash

# Script to clean up legacy authentication code

echo "Starting authentication code cleanup..."

# Mark files as deprecated with comments
echo "Marking deprecated files with comments..."

# Function to add deprecated comment to a file
add_deprecated_comment() {
  local file=$1
  local message=$2
  
  if [ -f "$file" ]; then
    # Check if file exists and doesn't already have a deprecated comment
    if ! grep -q "@deprecated" "$file"; then
      # Get file extension
      ext="${file##*.}"
      
      # Create appropriate comment based on file extension
      if [ "$ext" = "ts" ] || [ "$ext" = "tsx" ] || [ "$ext" = "js" ] || [ "$ext" = "jsx" ]; then
        # For TypeScript/JavaScript files
        sed -i.bak "1i/**\n * @deprecated $message\n * This file is maintained for backward compatibility and will be removed in a future version.\n * Please use the new implementation instead.\n */\n" "$file"
      elif [ "$ext" = "css" ] || [ "$ext" = "scss" ]; then
        # For CSS files
        sed -i.bak "1i/*\n * @deprecated $message\n * This file is maintained for backward compatibility and will be removed in a future version.\n * Please use the new implementation instead.\n */\n" "$file"
      fi
      
      # Remove backup file
      rm -f "${file}.bak"
      
      echo "Marked $file as deprecated"
    else
      echo "$file is already marked as deprecated"
    fi
  else
    echo "File $file does not exist, skipping"
  fi
}

# Mark deprecated files
add_deprecated_comment "packages/web/src/hooks/use-session.ts" "Please use useAuthSession from @/hooks/use-auth-session instead."
add_deprecated_comment "packages/web/src/lib/hooks/auth.tsx" "Please use useAuthSession from @/hooks/use-auth-session instead."
add_deprecated_comment "packages/web/src/lib/auth-client.ts" "Please use the Supabase client directly instead."

# Create a list of files that can be safely removed
echo "Creating list of files that can be safely removed..."

cat > cleanup-files.txt << EOL
# Web Package
packages/web/src/lib/auth.ts
packages/web/src/lib/auth-client.ts
packages/web/src/lib/auth/auth-config.ts
packages/web/src/lib/auth/auth-types.ts
packages/web/src/lib/auth/server-auth.ts
packages/web/src/lib/auth-refresh.ts
packages/web/src/hooks/use-auth.ts
packages/web/src/hooks/use-auth-with-cache.ts
packages/web/src/lib/services/auth.service.ts
packages/web/src/lib/auth/validation.ts
packages/web/src/lib/auth/token-service.ts
packages/web/src/lib/token-security.ts
packages/web/src/app/api/auth/sync-tokens/route.ts
packages/web/src/lib/auth/paths.ts

# API Package
packages/api/src/middleware/auth.middleware.ts
packages/api/src/routes/auth.routes.ts
packages/api/src/services/auth.service.ts
packages/api/src/services/token-validation.service.ts
packages/api/src/utils/jwt.ts
packages/api/src/services/account-lockout.service.ts
packages/api/src/services/password-policy.service.simplified.ts
EOL

echo "Created cleanup-files.txt with list of files that can be safely removed"
echo "Review this list before running the actual removal script"

# Create the actual removal script
cat > remove-legacy-auth.sh << EOL
#!/bin/bash

# Script to remove legacy authentication files
# WARNING: This will permanently delete files. Make sure you have a backup or commit before running.

echo "Removing legacy authentication files..."

# Function to remove a file if it exists
remove_file() {
  if [ -f "\$1" ]; then
    rm -f "\$1"
    echo "Removed \$1"
  else
    echo "File \$1 does not exist, skipping"
  fi
}

# Ask for confirmation
read -p "This will permanently delete legacy authentication files. Are you sure? (y/n) " -n 1 -r
echo
if [[ ! \$REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled"
  exit 1
fi

# Remove files from the list
while read -r line; do
  # Skip comments and empty lines
  [[ "\$line" =~ ^#.*$ ]] && continue
  [[ -z "\$line" ]] && continue
  
  remove_file "\$line"
done < cleanup-files.txt

echo "Legacy authentication files removed successfully."
EOL

# Make the removal script executable
chmod +x remove-legacy-auth.sh

echo "Created remove-legacy-auth.sh script"
echo "To remove the legacy files, run: ./remove-legacy-auth.sh"

# Create a script to remove unused dependencies
cat > remove-legacy-deps.sh << EOL
#!/bin/bash

# Script to remove unused dependencies
# WARNING: This may break your build if the dependencies are still in use.

echo "Removing unused authentication dependencies..."

# Ask for confirmation
read -p "This will remove unused dependencies. Are you sure? (y/n) " -n 1 -r
echo
if [[ ! \$REPLY =~ ^[Yy]$ ]]; then
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
EOL

# Make the dependency removal script executable
chmod +x remove-legacy-deps.sh

echo "Created remove-legacy-deps.sh script"
echo "To remove unused dependencies, run: ./remove-legacy-deps.sh"

echo "Authentication code cleanup preparation completed."
echo "Next steps:"
echo "1. Review the list of files in cleanup-files.txt"
echo "2. Run ./remove-legacy-auth.sh to remove legacy files"
echo "3. Run ./remove-legacy-deps.sh to remove unused dependencies"
