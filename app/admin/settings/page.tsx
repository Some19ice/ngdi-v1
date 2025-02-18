import { getSettings, type SystemSettings } from "@/app/actions/settings"
import { SettingsForm } from "./components/settings-form"

// Default settings if none are found in the database
const defaultSettings: SystemSettings = {
  siteName: "NGDI Portal",
  siteDescription:
    "Nigeria's central platform for geospatial data management and sharing",
  supportEmail: "support@ngdi.gov.ng",
  maxUploadSize: "100",
  defaultLanguage: "en",
  maintenanceMode: false,
  enableRegistration: true,
  requireEmailVerification: true,
  metadataValidation: true,
  autoBackup: true,
  backupFrequency: "daily",
  storageProvider: "local",
  apiRateLimit: "1000",
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return <SettingsForm initialSettings={settings || defaultSettings} />
}
