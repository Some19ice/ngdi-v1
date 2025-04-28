-- Create security_logs table for tracking authentication and security events
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add indexes for common query patterns
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_email ON security_logs(email);

-- Create RLS policies for the security_logs table
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with the 'admin' role can see all logs
CREATE POLICY admin_all_access ON security_logs 
  FOR ALL 
  TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Users can only see their own logs
CREATE POLICY user_own_logs ON security_logs 
  FOR SELECT 
  TO authenticated 
  USING (
    user_id = auth.uid()
  );

-- Grant permissions to the service_role
GRANT ALL ON security_logs TO service_role;

-- Grant read-only access to authenticated users
GRANT SELECT ON security_logs TO authenticated;
