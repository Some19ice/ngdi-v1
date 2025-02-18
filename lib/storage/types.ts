export interface FileUploadResult {
  url: string
  key: string
  size: number
  mimeType: string
}

export interface StorageConfig {
  maxSizeBytes?: number
  allowedMimeTypes?: string[]
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

export type StorageProviderType = "local" | "supabase" | "s3" | "azure" | "gcs"
