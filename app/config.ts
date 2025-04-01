// Configuration for all pages in the application
// This ensures pages that need dynamic content are rendered correctly

// Force dynamic rendering by default
export const dynamic = 'force-dynamic';

// Allow dynamic parameters in routes
export const dynamicParams = true;

// Disable automatic static optimization
export const unstable_skipMiddlewareUrlNormalize = true;

// Force runtime to be nodejs
export const runtime = 'nodejs'; 