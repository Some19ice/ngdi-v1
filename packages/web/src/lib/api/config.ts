/**
 * Get the full API URL for a given path
 * @param path The API path
 * @returns The full API URL
 */
export function getApiUrl(path: string): string {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    return path // Use relative path in browser
  }

  // In server environment, use absolute URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  return `${baseUrl}${path}`
} 