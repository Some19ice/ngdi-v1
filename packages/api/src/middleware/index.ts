import {
  authMiddleware,
  adminMiddleware,
  requireRole,
  requireAnyRole,
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

export {
  // Authentication middleware
  authMiddleware,
  adminMiddleware,
  requireRole,
  requireAnyRole,

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
