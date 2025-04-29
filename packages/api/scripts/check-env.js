// Script to check if environment variables are loaded correctly
console.log('Checking environment variables...');

// Check Supabase configuration
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

// Check database configuration
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set' : 'Not set');

// Check JWT configuration
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Check CORS configuration
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS ? 'Set' : 'Not set');

console.log('Environment check complete.');
