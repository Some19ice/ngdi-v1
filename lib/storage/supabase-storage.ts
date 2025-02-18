import { StorageProvider, StorageConfig, FileUploadResult } from "./types"
import { supabase } from "@/lib/supabase"

const DEFAULT_BUCKET = "public"
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export class SupabaseStorageProvider implements StorageProvider {
  private bucket: string

  constructor(bucket: string = DEFAULT_BUCKET) {
    this.bucket = bucket
  }

  async upload(
    file: File,
    path: string,
    config?: StorageConfig
  ): Promise<FileUploadResult> {
    if (config?.maxSizeBytes && file.size > config.maxSizeBytes) {
      throw new Error(
        `File size exceeds maximum allowed size of ${config.maxSizeBytes} bytes`
      )
    }

    if (
      config?.allowedMimeTypes &&
      !config.allowedMimeTypes.includes(file.type)
    ) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    const key = `${path}/${file.name}`

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(key, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(this.bucket).getPublicUrl(key)

    return {
      url: publicUrl,
      key,
      size: file.size,
      mimeType: file.type,
    }
  }

  async delete(key: string): Promise<boolean> {
    const { error } = await supabase.storage.from(this.bucket).remove([key])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }

    return true
  }

  async getUrl(key: string): Promise<string> {
    const {
      data: { publicUrl },
    } = supabase.storage.from(this.bucket).getPublicUrl(key)

    return publicUrl
  }
}
