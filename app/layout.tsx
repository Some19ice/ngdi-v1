import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { RootProvider } from "@/components/providers/root-provider"
import RootLayoutClient from "@/components/layout/root-layout-client"
import { getServerUser } from "@/lib/supabase-server"
import { getServerSession } from "next-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NGDI Portal",
  description: "National Geospatial Data Infrastructure Portal",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the user and session from the server
  const [user, session] = await Promise.all([
    getServerUser(),
    getServerSession(),
  ])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootProvider initialUser={user} session={session}>
          <RootLayoutClient>{children}</RootLayoutClient>
        </RootProvider>
      </body>
    </html>
  )
}
