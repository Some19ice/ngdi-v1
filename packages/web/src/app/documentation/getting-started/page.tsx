import { Metadata } from "next"
import { DocumentationLayout } from "@/components/documentation/layout"
import { ClientTOC } from "@/components/documentation/client-toc"

export const metadata: Metadata = {
  title: "Getting Started | Documentation",
  description: "Learn how to get started with our platform quickly and easily.",
}

export default function GettingStartedPage() {
  return (
    <DocumentationLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[1fr_220px] xl:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Getting Started
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Learn the basics and get up and running quickly with our platform.
          </p>

          <div className="space-y-8">
            <section id="introduction">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="mb-4">
                Welcome to our platform! This guide will help you understand the
                basics and get you started with using our services. We&apos;ll
                walk through the initial setup, key concepts, and point you to
                resources for more advanced topics.
              </p>
              <p>
                By the end of this guide, you&apos;ll have a working
                understanding of our platform and be ready to build your first
                project.
              </p>
            </section>

            <section id="prerequisites">
              <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
              <p className="mb-4">
                Before you begin, make sure you have the following:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                <li>
                  An account on our platform (if you don&apos;t have one yet,
                  see the Registration section below)
                </li>
                <li>
                  Basic familiarity with web technologies (HTML, CSS,
                  JavaScript)
                </li>
              </ul>
            </section>

            <section id="installation">
              <h2 className="text-2xl font-semibold mb-4">Installation</h2>
              <p className="mb-4">
                Our platform is cloud-based, so there&apos;s no software to
                install on your computer. However, if you want to use our CLI
                tools or SDKs, you can install them using npm:
              </p>
              <div className="bg-muted p-4 rounded-md mb-4 overflow-x-auto">
                <pre>
                  <code>npm install @our-platform/cli -g</code>
                </pre>
              </div>
              <p>Once installed, you can verify the installation by running:</p>
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre>
                  <code>platform-cli --version</code>
                </pre>
              </div>
            </section>

            <section id="creating-your-first-project">
              <h2 className="text-2xl font-semibold mb-4">
                Creating Your First Project
              </h2>
              <p className="mb-4">
                To create your first project, follow these steps:
              </p>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <p className="font-medium">Log in to your account</p>
                  <p className="text-muted-foreground">
                    Navigate to the dashboard at dashboard.ourplatform.com and
                    sign in with your credentials.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Create a new project</p>
                  <p className="text-muted-foreground">
                    Click on the &quot;New Project&quot; button in the top right
                    corner of the dashboard.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Configure your project</p>
                  <p className="text-muted-foreground">
                    Enter a name for your project and select the template that
                    best fits your needs.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Launch your project</p>
                  <p className="text-muted-foreground">
                    Click &quot;Create&quot; and wait for the setup to complete.
                    This usually takes less than a minute.
                  </p>
                </li>
              </ol>
            </section>

            <section id="next-steps">
              <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
              <p className="mb-4">
                Now that you have your first project set up, you might want to
                explore these resources next:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a
                    href="/documentation/guides/authentication"
                    className="text-primary hover:underline"
                  >
                    Authentication Guide
                  </a>{" "}
                  - Learn how to implement user authentication
                </li>
                <li>
                  <a
                    href="/documentation/guides/data-fetching"
                    className="text-primary hover:underline"
                  >
                    Data Fetching Strategies
                  </a>{" "}
                  - Best practices for fetching and managing data
                </li>
                <li>
                  <a
                    href="/documentation/components"
                    className="text-primary hover:underline"
                  >
                    UI Components
                  </a>{" "}
                  - Explore our component library
                </li>
              </ul>
            </section>
          </div>
        </div>
        <div className="hidden xl:block">
          <ClientTOC />
        </div>
      </div>
    </DocumentationLayout>
  )
}
