import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  )
}
