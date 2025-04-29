-- Remove security-related models
DROP TABLE IF EXISTS "FailedLogin";
DROP TABLE IF EXISTS "SecurityLog";

-- Remove security-related fields from User model
ALTER TABLE "User" DROP COLUMN IF EXISTS "locked";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lockedUntil";
ALTER TABLE "User" DROP COLUMN IF EXISTS "failedAttempts";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lastFailedAttempt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordLastChanged";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordExpiresAt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "previousPasswords";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordChangeRequired";

-- Remove index on passwordExpiresAt if it exists
DROP INDEX IF EXISTS "User_passwordExpiresAt_idx";
