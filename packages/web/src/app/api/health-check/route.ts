import { NextResponse } from "next/server"
import { getApiUrl } from "@/lib/api-config"

export const dynamic = "force-dynamic"
export const revalidate = 300 // Revalidate every 5 minutes
export const fetchCache = "force-cache" // Force caching of the response

export async function GET() {
  // Use the configured API endpoint
  const apiEndpoint = getApiUrl("/health");

  console.log("Health check attempting to connect to API endpoint:", apiEndpoint);

  const attempts = [];

  // Try the API endpoint
  try {
    console.log(`Trying API endpoint: ${apiEndpoint}`);

      // Create a promise that rejects after a timeout
      const timeoutPromise = new Promise<Response>((_, reject) => {
        const timeoutId = setTimeout(() => {
          clearTimeout(timeoutId);
          reject(new Error('API request timed out'));
        }, 1500);
      });

      // Create the fetch promise with proper headers
      const fetchPromise = fetch(apiEndpoint, {
        method: "GET",
        cache: "no-store",
        headers: {
          'Accept': 'application/json',
        },
      });

      // Race the fetch against the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.ok) {
        // Try to parse the response
        try {
          const data = await response.json();
          console.log(`API endpoint ${apiEndpoint} responded successfully:`, data);

          return NextResponse.json({
            status: "ok",
            apiServer: "healthy",
            message: "API server is running correctly",
            apiUrl: apiEndpoint,
            data,
          });
        } catch (parseError) {
          console.log(`Error parsing JSON from ${apiEndpoint}:`, parseError);
          // Even if we can't parse JSON, the server is responding
          return NextResponse.json({
            status: "ok",
            apiServer: "healthy",
            message: "API server is running but returned invalid JSON",
            apiUrl: apiEndpoint,
          });
        }
      } else {
        // Response not OK
        console.log(`API endpoint ${apiEndpoint} returned status ${response.status}`);
        attempts.push({
          url: apiEndpoint,
          status: response.status,
          error: `Status ${response.status}`
        });
      }
    } catch (error) {
      // Error connecting to this endpoint
      console.log(`Error connecting to ${apiEndpoint}:`, error);

      const isTimeout = error instanceof Error && error.message.includes("timed out");

      attempts.push({
        url: apiEndpoint,
        error: isTimeout
          ? "Connection timed out"
          : error instanceof Error ? error.message : "Unknown error"
      });
    }

  // If we get here, the attempt failed
  console.error("API health check attempt failed:", attempts);

  return NextResponse.json(
    {
      status: "error",
      apiServer: "unreachable",
      message: "API server is not responding",
      attempts,
    },
    { status: 200 } // Still return 200 to client
  );
}
