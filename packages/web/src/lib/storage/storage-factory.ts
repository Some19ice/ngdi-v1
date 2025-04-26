import { StorageProvider, StorageProviderType } from "./types"
import { ApiStorageProvider } from "./api-storage"

export class StorageFactory {
  private static instance: StorageFactory
  private providers: Map<StorageProviderType, StorageProvider>
  private activeProvider: StorageProviderType = "api"

  private constructor() {
    this.providers = new Map()
    this.initializeProviders()
  }

  private initializeProviders() {
    // Initialize API provider
    this.providers.set("api", new ApiStorageProvider())

    // Add other providers as needed
    // this.providers.set('s3', new S3StorageProvider())
    // this.providers.set('azure', new AzureStorageProvider())
  }

  public static getInstance(): StorageFactory {
    if (!StorageFactory.instance) {
      StorageFactory.instance = new StorageFactory()
    }
    return StorageFactory.instance
  }

  public setActiveProvider(provider: StorageProviderType) {
    if (!this.providers.has(provider)) {
      throw new Error(`Storage provider ${provider} is not available`)
    }
    this.activeProvider = provider
  }

  public getActiveProvider(): StorageProvider {
    const provider = this.providers.get(this.activeProvider)
    if (!provider) {
      throw new Error(`Active storage provider ${this.activeProvider} not found`)
    }
    return provider
  }

  public getProvider(type: StorageProviderType): StorageProvider {
    const provider = this.providers.get(type)
    if (!provider) {
      throw new Error(`Storage provider ${type} not found`)
    }
    return provider
  }
}

// Export a singleton instance
export const storageFactory = StorageFactory.getInstance()
