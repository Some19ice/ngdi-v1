import { StorageProvider, StorageConfig, FileUploadResult } from "./types"
import { authAxios } from "@/lib/auth-client"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export class ApiStorageProvider implements StorageProvider {
  private apiUrl: string

  constructor(apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") {
    this.apiUrl = apiUrl
  }

  async upload(
    file: File,
    path: string,
    config?: StorageConfig
  ): Promise<FileUploadResult> {
    if (config?.maxSizeBytes && file.size > config.maxSizeBytes) {
      throw new Error(
        `File size exceeds maximum allowed size of ${
          config.maxSizeBytes / (1024 * 1024)
        }MB`
      )
    }

    const maxSize = config?.maxSizeBytes || MAX_FILE_SIZE
    if (file.size > maxSize) {
      throw new Error(
        `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
      )
    }

    // Create form data
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", path)
    
    if (config?.metadata) {
      formData.append("metadata", JSON.stringify(config.metadata))
    }

    try {
      const response = await authAxios.post(
        `${this.apiUrl}/api/storage/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      return {
        key: response.data.key,
        url: response.data.url,
        size: file.size,
        contentType: file.type,
      }
    } catch (error: any) {
      console.error("Error uploading file:", error)
      throw new Error(
        error.response?.data?.message || "Failed to upload file"
      )
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await authAxios.delete(`${this.apiUrl}/api/storage/${key}`)
      return true
    } catch (error: any) {
      console.error("Error deleting file:", error)
      throw new Error(
        error.response?.data?.message || "Failed to delete file"
      )
    }
  }

  async getUrl(key: string): Promise<string> {
    try {
      const response = await authAxios.get(`${this.apiUrl}/api/storage/url/${key}`)
      return response.data.url
    } catch (error: any) {
      console.error("Error getting file URL:", error)
      throw new Error(
        error.response?.data?.message || "Failed to get file URL"
      )
    }
  }
} 