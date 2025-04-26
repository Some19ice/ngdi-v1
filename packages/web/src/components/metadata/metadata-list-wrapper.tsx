"use client"

import { MetadataList } from "./metadata-list"
import { MetadataItem } from "@/types/metadata"

interface MetadataListWrapperProps {
  initialMetadata: MetadataItem[]
  initialTotal: number
  authToken?: string
}

export function MetadataListWrapper({
  initialMetadata,
  initialTotal,
  authToken,
}: MetadataListWrapperProps) {
  return (
    <MetadataList
      initialMetadata={initialMetadata}
      initialTotal={initialTotal}
      authToken={authToken}
    />
  )
}
