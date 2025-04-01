// Configuration for all API routes
// This ensures they are rendered dynamically and not statically generated

// Force dynamic rendering for all API routes
export const dynamic = 'force-dynamic';

// Allow dynamic parameters in routes
export const dynamicParams = true;

// Disable caching for API routes
export const revalidate = 0;

// Disable static generation
export const generateStaticParams = () => {
  return [];
};

// Force runtime to be nodejs
export const runtime = 'nodejs'; 