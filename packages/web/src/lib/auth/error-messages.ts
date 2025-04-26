/**
 * User-friendly error messages for authentication scenarios
 * These messages improve user experience by providing clear guidance on what went wrong
 */

export const UserAuthErrorMessages: Record<string, string> = {
  // Error codes from URLs
  "CredentialsSignin": "Invalid email or password. Please try again.",
  "missing_token": "Your session has expired. Please sign in again.",
  "invalid_token": "Your session is invalid. Please sign in again.",
  "session_expired": "Your session has expired. Please sign in again.",
  "OAuthAccountNotLinked": "This account is already linked to another authentication method.",
  "EmailSignin": "Failed to send login email. Please try again.",
  "callback": "Error during authentication callback. Please try again.",
  "OAuthSignin": "Error connecting to authentication provider.",
  "OAuthCallback": "Error from authentication provider.",
  
  // API error codes
  "INVALID_CREDENTIALS": "Invalid email or password. Please check your credentials and try again.",
  "ACCOUNT_DISABLED": "Your account has been disabled. Please contact support.",
  "EMAIL_NOT_VERIFIED": "Please verify your email before signing in. Check your inbox for a verification link.",
  "ACCOUNT_LOCKED": "Your account has been temporarily locked due to too many failed login attempts. Please try again later.",
  "PASSWORD_EXPIRED": "Your password has expired. Please reset your password.",
  "RATE_LIMITED": "Too many login attempts. Please try again in a few minutes.",
  "INVALID_TOKEN": "Your authentication session has expired. Please sign in again.",
  "INVALID_REFRESH_TOKEN": "Unable to refresh your session. Please sign in again.",
  "SERVER_ERROR": "We're experiencing technical difficulties. Please try again later.",
  "NETWORK_ERROR": "Connection issue. Please check your internet connection and try again.",
  "USER_NOT_FOUND": "Account not found. Please check your email or sign up for a new account.",
  "CSRF_ERROR": "Security validation failed. Please reload the page and try again.",
  
  // Generic fallbacks
  "DEFAULT": "An unexpected error occurred. Please try again.",
  "LOGIN_FAILED": "Failed to sign in. Please check your credentials and try again.",
  
  // Form validation errors
  "INVALID_EMAIL": "Please enter a valid email address.",
  "REQUIRED_FIELD": "This field is required.",
  "PASSWORD_TOO_SHORT": "Password must be at least 6 characters long.",
  "PASSWORD_REQUIREMENTS": "Password must include uppercase, lowercase, number, and special character.",
  "PASSWORDS_DONT_MATCH": "Passwords do not match.",
  
  // Multi-factor authentication
  "MFA_REQUIRED": "Please complete multi-factor authentication to continue.",
  "MFA_FAILED": "Failed to verify multi-factor authentication. Please try again.",
  "MFA_CODE_INVALID": "Invalid verification code. Please check and try again."
} 