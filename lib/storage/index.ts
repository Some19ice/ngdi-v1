export * from "./types"
export * from "./storage-factory"
export * from "./supabase-storage"

import { StorageFactory } from "./storage-factory"

// Export a singleton instance of the storage factory
export const storageFactory = StorageFactory.getInstance()

// Export a convenience function to get the active storage provider
export function getStorage() {
  return storageFactory.getActiveProvider()
}
