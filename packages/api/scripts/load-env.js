// Script to load environment variables from .env file
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');

console.log('Loading environment variables...');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log(`.env file found at ${envPath}`);
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  
  // Set environment variables
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
} else {
  console.log(`.env file not found at ${envPath}`);
}

// Check if .env.local file exists (overrides .env)
if (fs.existsSync(envLocalPath)) {
  console.log(`.env.local file found at ${envLocalPath}`);
  const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  
  // Set environment variables
  for (const key in envLocalConfig) {
    process.env[key] = envLocalConfig[key];
  }
} else {
  console.log(`.env.local file not found at ${envLocalPath}`);
}

// Check if environment variables are loaded
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

console.log('Environment variables loaded.');
