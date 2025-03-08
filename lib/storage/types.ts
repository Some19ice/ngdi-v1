export interface FileUploadResult {
  key: string
  url: string
  size: number
  contentType: string
}

export interface StorageConfig {
  maxSizeBytes?: number
  metadata?: Record<string, string>
  contentType?: string
  cacheControl?: string
}

export interface StorageProvider {
  upload(
    file: File,
    path: string,
    config?: StorageConfig
  ): Promise<FileUploadResult>
  delete(key: string): Promise<boolean>
  getUrl(key: string): Promise<string>
}

export type StorageProviderType = "api" | "s3" | "azure"
