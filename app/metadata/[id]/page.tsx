import { Metadata } from "@prisma/client"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth-options"
import { MetadataView } from "@/components/metadata/metadata-view"

interface MetadataPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: MetadataPageProps) {
  const metadata = await prisma.metadata.findUnique({
    where: { id: params.id },
  })

  if (!metadata) {
    return {
      title: "Metadata Not Found",
    }
  }

  return {
    title: `${metadata.title} - Metadata Details`,
  }
}

export default async function MetadataPage({ params }: MetadataPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return notFound()
  }

  const metadata = await prisma.metadata.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          organization: true,
        },
      },
    },
  })

  if (!metadata) {
    return notFound()
  }

  const canEdit =
    session.user.id === metadata.userId || session.user.role === "ADMIN"

  return (
    <div className="container mx-auto py-8">
      <MetadataView metadata={metadata} canEdit={canEdit} />
    </div>
  )
}
