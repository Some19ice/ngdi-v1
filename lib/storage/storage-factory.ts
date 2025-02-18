import { StorageProvider, StorageProviderType } from "./types"
import { SupabaseStorageProvider } from "./supabase-storage"

export class StorageFactory {
  private static instance: StorageFactory
  private providers: Map<StorageProviderType, StorageProvider>
  private activeProvider: StorageProviderType = "supabase"

  private constructor() {
    this.providers = new Map()
    this.initializeProviders()
  }

  private initializeProviders() {
    // Initialize Supabase provider
    this.providers.set("supabase", new SupabaseStorageProvider())

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
      throw new Error(`Storage provider ${provider} is not implemented`)
    }
    this.activeProvider = provider
  }

  public getActiveProvider(): StorageProvider {
    const provider = this.providers.get(this.activeProvider)
    if (!provider) {
      throw new Error(
        `No storage provider available for ${this.activeProvider}`
      )
    }
    return provider
  }

  public getProvider(type: StorageProviderType): StorageProvider {
    const provider = this.providers.get(type)
    if (!provider) {
      throw new Error(`Storage provider ${type} is not implemented`)
    }
    return provider
  }
}
