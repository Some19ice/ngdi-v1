// Configuration for all auth pages
// This ensures they are rendered dynamically and not statically generated

// Force dynamic rendering for all auth pages
export const dynamic = 'force-dynamic';

// Allow dynamic parameters in routes
export const dynamicParams = true;

// Disable caching for auth pages
export const revalidate = 0;

// Disable static generation for auth pages
export const generateStaticParams = () => {
  return [];
};

// Disable static optimization
export const unstable_skipMiddlewareUrlNormalize = true;

// Force runtime to be nodejs
export const runtime = 'nodejs';
