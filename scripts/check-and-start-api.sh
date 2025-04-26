#!/bin/bash

# Script to check if API is running and start it if not
API_PORT=3001
API_URL="http://localhost:$API_PORT"
MAX_ATTEMPTS=5
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
API_DIR="$SCRIPT_DIR/../packages/api"

# Function to check API health
check_api_health() {
  echo "Checking API health..."
  
  for endpoint in "$API_URL/health" "$API_URL/api/health"; do
    echo "Trying $endpoint"
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$endpoint" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
      echo "✅ API is running at $endpoint"
      return 0
    else
      echo "❌ API returned $response at $endpoint"
    fi
  done
  
  return 1
}

# Check if API is already running
if check_api_health; then
  echo "✅ API server is already running"
  exit 0
fi

# API isn't running, so let's start it
echo "Starting API server..."

# First try the start-api.js script
echo "Launching API server with start-api.js..."
node "$SCRIPT_DIR/start-api.js" &

# Wait and check if API has started
attempts=0
while [ $attempts -lt $MAX_ATTEMPTS ]; do
  sleep 5
  attempts=$((attempts + 1))
  echo "Checking if API is up (attempt $attempts/$MAX_ATTEMPTS)"
  
  if check_api_health; then
    echo "✅ API server started successfully!"
    exit 0
  fi
done

# If we get here, the API didn't start with start-api.js
echo "Warning: API didn't start with start-api.js, trying direct npm run dev..."

# Try direct npm run dev as fallback
cd "$API_DIR" && npm run dev > /dev/null 2>&1 &

# Wait again and check if API has started
attempts=0
while [ $attempts -lt $MAX_ATTEMPTS ]; do
  sleep 5
  attempts=$((attempts + 1))
  echo "Checking if API is up after direct npm run (attempt $attempts/$MAX_ATTEMPTS)"
  
  if check_api_health; then
    echo "✅ API server started successfully with direct npm run!"
    exit 0
  fi
done

echo "❌ Failed to start API server after multiple attempts"
echo "Please check logs and try starting manually with: cd packages/api && npm run dev"
exit 1 