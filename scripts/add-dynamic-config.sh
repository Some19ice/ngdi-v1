#!/bin/bash

# This script adds dynamic configuration to pages that use dynamic server features

# Create the page-config.ts file
create_config_file() {
  local dir=$1
  echo "Creating config file for $dir"
  cat > "$dir/page-config.ts" << EOF
// Import dynamic configuration from shared config
export { dynamic } from '@/lib/config/dynamic-routes';
EOF
}

# Update the page.tsx file to import the dynamic configuration
update_page_file() {
  local file=$1
  echo "Updating $file"
  
  # Check if the file already imports the dynamic configuration
  if grep -q "import { dynamic } from \"./page-config\"" "$file"; then
    echo "File already imports dynamic configuration, skipping"
    return
  fi
  
  # Add the import after the "use client" directive
  sed -i '' -e '/^"use client"/a\\
// Import the dynamic configuration\
import { dynamic } from "./page-config"' "$file"
}

# Process each page that uses dynamic server features
process_pages() {
  local pages=$1
  
  for page in $pages; do
    dir=$(dirname "$page")
    create_config_file "$dir"
    update_page_file "$page"
  done
}

# Find pages that use headers, cookies, or searchParams
headers_pages=$(find packages/web/src/app -name "page.tsx" | xargs grep -l "headers")
cookies_pages=$(find packages/web/src/app -name "page.tsx" | xargs grep -l "cookies")
search_params_pages=$(find packages/web/src/app -name "page.tsx" | xargs grep -l "searchParams")

# Combine the lists and remove duplicates
all_pages=$(echo "$headers_pages $cookies_pages $search_params_pages" | tr ' ' '\n' | sort | uniq)

# Process all pages
process_pages "$all_pages"

echo "Done!"
