ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "mobileNumber" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "designation" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "notes" TEXT;

UPDATE "AdminUser"
SET "role" = 'super_admin'
WHERE LOWER("email") = 'admin@i2econsulting.com';
