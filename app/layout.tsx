import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"
import RootLayoutClient from "@/components/layout/root-layout-client"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NGDI Portal",
  description: "National Geospatial Data Infrastructure Portal",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <RootLayoutClient>{children}</RootLayoutClient>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
