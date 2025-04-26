-- Add security-related fields to User model
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "failedAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastFailedAttempt" TIMESTAMP(3);

-- Create FailedLogin table
CREATE TABLE IF NOT EXISTS "FailedLogin" (
    "email" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lockedUntil" TIMESTAMP(3),
    "firstAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetAt" TIMESTAMP(3),

    CONSTRAINT "FailedLogin_pkey" PRIMARY KEY ("email")
);

-- Create SecurityLog table
CREATE TABLE IF NOT EXISTS "SecurityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "eventType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for SecurityLog
CREATE INDEX IF NOT EXISTS "SecurityLog_userId_idx" ON "SecurityLog"("userId");
CREATE INDEX IF NOT EXISTS "SecurityLog_email_idx" ON "SecurityLog"("email");
CREATE INDEX IF NOT EXISTS "SecurityLog_eventType_idx" ON "SecurityLog"("eventType");
CREATE INDEX IF NOT EXISTS "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");

-- Add foreign key constraint if User table exists
ALTER TABLE "SecurityLog" ADD CONSTRAINT "SecurityLog_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
