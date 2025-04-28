import { z } from "zod"
import { AUTH_CONFIG } from "../auth/config"

/**
 * Centralized validation schemas for the application
 * This ensures consistent validation rules across all forms
 */

// Common validation patterns
const PATTERNS = {
  // Phone number: international format with optional country code
  PHONE: /^\+?[1-9]\d{1,14}$/,
  // URL: standard URL format
  URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  // Alphanumeric with spaces
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9 ]+$/,
  // Letters only
  LETTERS_ONLY: /^[a-zA-Z]+$/,
  // Numbers only
  NUMBERS_ONLY: /^[0-9]+$/,
  // Date in YYYY-MM-DD format
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  // Time in HH:MM format
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  // Latitude
  LATITUDE: /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/,
  // Longitude
  LONGITUDE: /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/,
}

// Common error messages
export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_URL: "Please enter a valid URL",
  INVALID_PHONE: "Please enter a valid phone number",
  INVALID_PASSWORD: "Password does not meet the requirements",
  PASSWORDS_DONT_MATCH: "Passwords don't match",
  MIN_LENGTH: (field: string, length: number) => `${field} must be at least ${length} characters`,
  MAX_LENGTH: (field: string, length: number) => `${field} must be at most ${length} characters`,
  INVALID_DATE: "Please enter a valid date",
  INVALID_TIME: "Please enter a valid time",
  INVALID_LATITUDE: "Please enter a valid latitude (-90 to 90)",
  INVALID_LONGITUDE: "Please enter a valid longitude (-180 to 180)",
}

// User schemas
export const nameSchema = z.string().min(2, ERROR_MESSAGES.MIN_LENGTH("Name", 2))

export const emailSchema = z.string().email(ERROR_MESSAGES.INVALID_EMAIL)

export const passwordSchema = z
  .string()
  .min(AUTH_CONFIG.security.passwordMinLength, ERROR_MESSAGES.MIN_LENGTH("Password", AUTH_CONFIG.security.passwordMinLength))
  .max(AUTH_CONFIG.security.passwordMaxLength, ERROR_MESSAGES.MAX_LENGTH("Password", AUTH_CONFIG.security.passwordMaxLength))
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

export const phoneSchema = z
  .string()
  .regex(PATTERNS.PHONE, ERROR_MESSAGES.INVALID_PHONE)
  .optional()
  .or(z.literal(""))

export const urlSchema = z
  .string()
  .regex(PATTERNS.URL, ERROR_MESSAGES.INVALID_URL)
  .optional()
  .or(z.literal(""))

// Organization schemas
export const organizationSchema = z.string().min(2, ERROR_MESSAGES.MIN_LENGTH("Organization", 2))

export const departmentSchema = z.string().optional().or(z.literal(""))

// Address schemas
export const addressSchema = z.string().min(5, ERROR_MESSAGES.MIN_LENGTH("Address", 5))

export const citySchema = z.string().min(2, ERROR_MESSAGES.MIN_LENGTH("City", 2))

export const stateSchema = z.string().min(2, ERROR_MESSAGES.MIN_LENGTH("State", 2))

export const zipCodeSchema = z.string().min(5, ERROR_MESSAGES.MIN_LENGTH("Zip code", 5))

export const countrySchema = z.string().min(2, ERROR_MESSAGES.MIN_LENGTH("Country", 2))

// Date and time schemas
export const dateSchema = z.string().regex(PATTERNS.DATE, ERROR_MESSAGES.INVALID_DATE)

export const timeSchema = z.string().regex(PATTERNS.TIME, ERROR_MESSAGES.INVALID_TIME)

// Geospatial schemas
export const latitudeSchema = z.string().regex(PATTERNS.LATITUDE, ERROR_MESSAGES.INVALID_LATITUDE)

export const longitudeSchema = z.string().regex(PATTERNS.LONGITUDE, ERROR_MESSAGES.INVALID_LONGITUDE)

// Common form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, ERROR_MESSAGES.REQUIRED),
  rememberMe: z.boolean().default(false),
})

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    organization: organizationSchema,
    department: departmentSchema,
    phone: phoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ["confirmPassword"],
  })

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ["confirmPassword"],
  })

export const profileSchema = z.object({
  name: nameSchema,
  organization: organizationSchema,
  department: departmentSchema,
  phone: phoneSchema,
})

// Export types for the schemas
export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
