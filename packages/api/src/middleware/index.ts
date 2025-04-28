import {
  authMiddleware,
  adminMiddleware,
  requireRole,
  requireAnyRole,
  requireEmailVerification,
} from "./auth.middleware"
import { errorHandler } from "./error-handler"
import { validateBody, validateQuery, validateParams } from "./validation"
import { rateLimit, authRateLimit } from "./rate-limit"
import {
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  requireOwnership,
  requireActivity,
} from "./permission.middleware"
import { requireValidPassword } from "./password-policy.middleware"

export {
  // Authentication middleware
  authMiddleware,
  adminMiddleware,
  requireRole,
  requireAnyRole,
  requireEmailVerification,
  requireValidPassword,

  // Permission middleware
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  requireOwnership,
  requireActivity,

  // Other middleware
  errorHandler,
  validateBody,
  validateQuery,
  validateParams,
  rateLimit,
  authRateLimit,
}