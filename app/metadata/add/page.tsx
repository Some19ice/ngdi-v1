import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MetadataForm } from "./components/metadata-form"
import LoadingSpinner from "@/components/loading-spinner"

export const metadata = {
  title: "Add Metadata",
  description: "Add new metadata entry",
}

export default async function AddMetadataPage() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      redirect("/auth/signin")
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <MetadataForm />
      </Suspense>
    )
  } catch (error) {
    console.error("Auth error:", error)
    redirect("/auth/error")
  }
}
