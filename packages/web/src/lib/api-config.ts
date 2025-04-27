/**
 * Centralized API configuration
 * This file provides a single source of truth for API-related configuration
 */

// Default API URL if environment variable is not set
const DEFAULT_API_URL = 'http://localhost:3001';

// Fallback ports to try if the main port is unavailable
const FALLBACK_PORTS = [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];

// Track if we've logged API configuration warnings
let hasLoggedApiWarning = false;

// Track which port was last successfully used
let lastSuccessfulPort: number | null = null;

/**
 * Get the API base URL with fallbacks
 */
export function getApiBaseUrl(): string {
  // If we've already found a working port, use that
  if (lastSuccessfulPort !== null && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `http://localhost:${lastSuccessfulPort}`;
  }

  // For client-side, check window.ENV first (if we have injected env vars)
  if (typeof window !== 'undefined' && window.__ENV && window.__ENV.NEXT_PUBLIC_API_URL) {
    return window.__ENV.NEXT_PUBLIC_API_URL;
  }

  // Then check process.env
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Log warning about missing environment variable (only once)
  if (!hasLoggedApiWarning && typeof window !== 'undefined') {
    console.warn(
      'NEXT_PUBLIC_API_URL environment variable is not set. ' +
      `Using default API URL: ${DEFAULT_API_URL}. ` +
      'This may cause issues if the API is hosted elsewhere.'
    );
    hasLoggedApiWarning = true;
  }

  // For development, check if we're running on localhost and the API is likely on port 3001
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // If we're on localhost:3000, the API is likely on localhost:3001
    const apiUrl = `http://${window.location.hostname}:3001`;
    return apiUrl;
  }

  // Fallback to default
  return DEFAULT_API_URL;
}

/**
 * Get a full API URL for a specific endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();

  // Ensure endpoint starts with / and baseUrl doesn't end with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  const fullUrl = `${normalizedBaseUrl}${normalizedEndpoint}`;

  return fullUrl;
}

/**
 * Result of API availability check
 */
export interface ApiAvailabilityResult {
  available: boolean;
  port?: number;
  url?: string;
  error?: string;
  attempts?: Array<{port: number, error?: string}>;
}

/**
 * Check if the API server is available
 * @returns Promise that resolves to an ApiAvailabilityResult object
 */
export async function checkApiAvailability(): Promise<boolean> {
  const result = await checkApiAvailabilityDetailed();
  return result.available;
}

/**
 * Check if the API server is available with detailed results
 * @returns Promise that resolves to an ApiAvailabilityResult object
 */
export async function checkApiAvailabilityDetailed(): Promise<ApiAvailabilityResult> {
  const attempts: Array<{port: number, error?: string}> = [];

  // First try the Next.js API proxy route which can avoid CORS issues
  try {
    console.log('Trying API health check via Next.js API proxy route');
    const response = await fetch('/api/health-check', {
      method: 'GET',
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.apiServer === 'healthy') {
        console.log('API server is healthy via proxy route');
        // Try to extract port from the API URL if available
        try {
          const apiUrl = data.apiUrl || getApiUrl('/health');
          const url = new URL(apiUrl);
          const port = parseInt(url.port || '3001');
          lastSuccessfulPort = port;

          return {
            available: true,
            port,
            url: apiUrl
          };
        } catch (e) {
          // URL parsing error, but the API is still available
          return {
            available: true,
            url: data.apiUrl || getApiUrl('/health')
          };
        }
      }
    }
  } catch (error) {
    console.log('Proxy health check failed, will try direct connections:',
      error instanceof Error ? error.message : 'Unknown error');
  }

  // If we've already found a working port, try that first
  if (lastSuccessfulPort !== null) {
    try {
      const customUrl = `http://localhost:${lastSuccessfulPort}`;
      console.log(`Trying previously successful port: ${lastSuccessfulPort}`);
      const response = await fetchWithTimeout(`${customUrl}/health`, 3000);
      if (response.ok) {
        return {
          available: true,
          port: lastSuccessfulPort,
          url: customUrl
        };
      }
    } catch (error) {
      // If the previously successful port fails, reset it and try all ports
      console.log(`Previously successful port ${lastSuccessfulPort} failed, will try all ports`);
      attempts.push({
        port: lastSuccessfulPort,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      lastSuccessfulPort = null;
    }
  }

  // Try the configured URL first
  try {
    const apiUrl = getApiUrl('/health');
    console.log(`Trying configured API URL: ${apiUrl}`);

    const response = await fetchWithTimeout(apiUrl, 3000);
    if (response.ok) {
      // Extract port from URL for future reference
      try {
        const url = new URL(apiUrl);
        const port = parseInt(url.port || '3001');
        lastSuccessfulPort = port;
        console.log(`API server found at configured URL: ${apiUrl}`);
        return {
          available: true,
          port,
          url: apiUrl
        };
      } catch (e) {
        // URL parsing error, but the API is still available
        console.log(`API server found at configured URL: ${apiUrl} (port unknown)`);
        return {
          available: true,
          url: apiUrl
        };
      }
    } else {
      // Response not OK
      const text = await response.text().catch(() => 'No response body');
      console.log(`API server at ${apiUrl} returned status ${response.status}: ${text}`);
      attempts.push({
        port: 3001,
        error: `Status ${response.status}`
      });
    }
  } catch (error) {
    // Error connecting to configured URL
    console.log(`Error connecting to configured API URL:`, error);
    attempts.push({
      port: 3001,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // If the main URL fails, try fallback ports
  for (const port of FALLBACK_PORTS) {
    try {
      // Skip the port we already tried from the main URL
      if (port === lastSuccessfulPort) continue;

      // Try both with and without /api prefix
      const endpoints = [
        `http://localhost:${port}/health`,
        `http://localhost:${port}/api/health`
      ];

      let success = false;

      for (const fallbackUrl of endpoints) {
        try {
          console.log(`Trying fallback endpoint: ${fallbackUrl}`);
          const response = await fetchWithTimeout(fallbackUrl, 2000);

          if (response.ok) {
            // Remember this port for future checks
            lastSuccessfulPort = port;
            console.log(`API server found at: ${fallbackUrl}`);
            return {
              available: true,
              port,
              url: fallbackUrl
            };
          } else {
            // Response not OK
            const text = await response.text().catch(() => 'No response body');
            console.log(`API server at ${fallbackUrl} returned status ${response.status}: ${text}`);
          }
        } catch (endpointError) {
          console.log(`Error connecting to ${fallbackUrl}:`,
            endpointError instanceof Error ? endpointError.message : 'Unknown error');
        }
      }

      // If we get here, both endpoints failed
      attempts.push({
        port,
        error: `Failed to connect to both health endpoints on port ${port}`
      });
    } catch (error) {
      // Error in the outer try/catch
      console.log(`Error checking port ${port}:`, error);
      attempts.push({
        port,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // If we get here, all attempts failed
  console.error('API availability check failed on all ports', { attempts });
  return {
    available: false,
    error: 'API server not available on any port',
    attempts
  };
}

/**
 * Helper function to fetch with a timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  // Create a promise that rejects after a timeout
  const timeoutPromise = new Promise<Response>((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error('API request timed out'));
    }, timeoutMs);
  });

  // Create the fetch promise with proper CORS settings
  const fetchPromise = fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  try {
    // Race the fetch against the timeout
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

// Add TypeScript declaration for window.__ENV
declare global {
  interface Window {
    __ENV?: {
      NEXT_PUBLIC_API_URL?: string;
      [key: string]: any;
    };
  }
}
