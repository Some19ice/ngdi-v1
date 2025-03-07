export interface ApiError {
  code: string
  message: string
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: ApiError[]
}

export interface PaginatedResponse<T>
  extends ApiResponse<{
    items: T[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {}
