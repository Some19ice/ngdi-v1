// Configuration for auth callback route
// This ensures it's rendered dynamically and not statically generated

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Allow dynamic parameters
export const dynamicParams = true;

// Disable caching
export const revalidate = 0;

// Force runtime to be nodejs
export const runtime = 'nodejs'; 