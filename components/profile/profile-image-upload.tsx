"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { type ProfileImageUploadProps } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"

export function ProfileImageUpload({
  currentImage,
  onUpload,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const file = acceptedFiles[0]
        if (!file) return

        setIsUploading(true)
        await onUpload(file)
      } catch (error) {
        console.error("Failed to upload image:", error)
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
    multiple: false,
  })

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentImage || undefined} />
        <AvatarFallback>
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Camera className="h-6 w-6" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className={isDragActive ? "border-primary" : ""}
          >
            {isUploading
              ? "Uploading..."
              : isDragActive
              ? "Drop the image here"
              : "Upload new image"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Supported formats: PNG, JPG, GIF. Max size: 5MB.
        </p>
      </div>
    </div>
  )
}
