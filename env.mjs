// @ts-check

/** @type {Record<string, string>} */
export const env = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/ngdi_test?schema=test",
  DIRECT_URL:
    process.env.DIRECT_URL ||
    "postgresql://postgres:postgres@localhost:5432/ngdi_test?schema=test",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3000",
  DEBUG: process.env.DEBUG || "false",
}
