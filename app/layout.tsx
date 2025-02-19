import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/auth-options"
import { Providers } from "@/components/providers"
import RootLayoutClient from "@/components/layout/root-layout-client"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial", "sans-serif"],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: "NGDI Portal - Nigeria Geospatial Data Infrastructure",
  description:
    "The central platform for Nigeria's geospatial data management, discovery, and sharing.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          <RootLayoutClient>{children}</RootLayoutClient>
        </Providers>
      </body>
    </html>
  )
}
