#!/bin/bash

# Script to remove legacy authentication files
# WARNING: This will permanently delete files. Make sure you have a backup or commit before running.

echo "Removing legacy authentication files..."

# Function to remove a file if it exists
remove_file() {
  if [ -f "$1" ]; then
    rm -f "$1"
    echo "Removed $1"
  else
    echo "File $1 does not exist, skipping"
  fi
}

# Ask for confirmation
read -p "This will permanently delete legacy authentication files. Are you sure? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled"
  exit 1
fi

# Remove files from the list
while read -r line; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue
  
  remove_file "$line"
done < cleanup-files.txt

echo "Legacy authentication files removed successfully."
