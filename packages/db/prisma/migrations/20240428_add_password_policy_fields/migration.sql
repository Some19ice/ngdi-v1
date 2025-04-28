-- Add password policy fields to User model
ALTER TABLE "User" ADD COLUMN "passwordLastChanged" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "passwordExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "previousPasswords" JSONB DEFAULT '[]';
ALTER TABLE "User" ADD COLUMN "passwordChangeRequired" BOOLEAN NOT NULL DEFAULT false;

-- Create index for password expiration queries
CREATE INDEX "User_passwordExpiresAt_idx" ON "User"("passwordExpiresAt");

-- Update existing users to set password expiration date
-- Set expiration to 90 days from now for all existing users
UPDATE "User" SET "passwordExpiresAt" = CURRENT_TIMESTAMP + INTERVAL '90 days';
