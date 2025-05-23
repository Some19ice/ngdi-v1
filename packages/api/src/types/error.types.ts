export enum AuthErrorCode {
  INVALID_CREDENTIALS = "AUTH001",
  ACCOUNT_LOCKED = "AUTH002",
  TOKEN_EXPIRED = "AUTH003",
  INSUFFICIENT_PERMISSIONS = "AUTH004",
  TOKEN_BLACKLISTED = "AUTH005",
  RATE_LIMITED = "AUTH006",
  INVALID_TOKEN = "AUTH007",
  EMAIL_NOT_VERIFIED = "AUTH008",
  PASSWORD_POLICY = "AUTH009",
  MFA_REQUIRED = "AUTH010",
  FORBIDDEN = "AUTH011",
  CSRF_TOKEN_INVALID = "AUTH012",
  INVALID_CSRF = "AUTH013",
  REGISTRATION_FAILED = "AUTH014",
  VERIFICATION_FAILED = "AUTH015",
  RESET_PASSWORD_FAILED = "AUTH016",
  SERVER_ERROR = "AUTH017",
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public status: number = 401,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export interface ErrorResponse {
  success: false
  code: string
  message: string
  details?: Record<string, any> | any[]
}
