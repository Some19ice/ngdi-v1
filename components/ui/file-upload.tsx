"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Progress } from "./progress"

interface FileUploadProps {
  onUploadComplete?: (result: { url: string; key: string }) => void
  onUploadError?: (error: Error) => void
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
  path?: string
  className?: string
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxSize = 50 * 1024 * 1024, // 50MB default
  acceptedFileTypes = ["image/*", "application/pdf"],
  path = "uploads",
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setSelectedFile(file)
      setIsUploading(true)
      setUploadProgress(0)

      try {
        // Use the imported storage directly
        // const storage = getStorage()

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 500)

        const result = await storage.upload(file, path, {
          maxSizeBytes: maxSize,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        onUploadComplete?.(result)
        toast.success("File uploaded successfully")
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Upload failed")
        onUploadError?.(err)
        toast.error(err.message)
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [maxSize, path, onUploadComplete, onUploadError]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedFileTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    multiple: false,
    disabled: isUploading,
  })

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary">Drop the file here</p>
            ) : (
              <>
                <p>
                  <span className="font-medium">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  {acceptedFileTypes.join(", ")} (max{" "}
                  {(maxSize / 1024 / 1024).toFixed(0)}MB)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">{selectedFile.name}</div>
              <div className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
              </div>
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isUploading && (
            <div className="mt-2 space-y-2">
              <Progress value={uploadProgress} />
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
