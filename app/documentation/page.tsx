import { Metadata } from "next"
import { DocumentationLayout } from "@/components/documentation/layout"
import { DocCard } from "@/components/documentation/doc-card"

export const metadata: Metadata = {
  title: "NGDI Documentation",
  description: "Learn more about the NGDI project and how to use our platform.",
}

export default function DocumentationPage() {
  return (
    <DocumentationLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          NGDI Documentation
        </h1>
        <p className="text-lg mb-6">
          Welcome to the NGDI documentation. Here you&apos;ll find comprehensive
          guides to help you understand our project, its mission, and how to
          make the most of our platform.
        </p>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <DocCard
            title="About NGDI"
            description="Learn about our mission, history, and the impact we're making."
            href="/documentation/about-ngdi"
          />
          <DocCard
            title="User Guide"
            description="Everything you need to know to use the NGDI platform effectively."
            href="/documentation/user-guide"
          />
          <DocCard
            title="Data & Resources"
            description="Explore the data, maps, and resources available through NGDI."
            href="/documentation/data-resources"
          />
        </div>
      </div>
    </DocumentationLayout>
  )
}
