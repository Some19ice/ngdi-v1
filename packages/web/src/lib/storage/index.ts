export * from "./types"
export * from "./storage-factory"
export * from "./api-storage"

// Export the default storage provider
import { storageFactory } from "./storage-factory"
export const storage = storageFactory.getActiveProvider()
