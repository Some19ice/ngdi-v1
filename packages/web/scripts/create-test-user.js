// Script to create a test user in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  console.log('Creating test user in Supabase...');
  
  try {
    // Create a test user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'Password123!',
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: 'Test User',
        role: 'USER'
      }
    });
    
    if (error) {
      console.error('Error creating test user:', error);
      return;
    }
    
    console.log('Test user created successfully:', data);
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestUser();
