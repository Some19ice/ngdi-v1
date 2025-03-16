import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function HomePage() {
  // Check if user is authenticated
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth_token")

  // If user is already authenticated, show a different CTA
  const isAuthenticated = !!authToken

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/90 to-primary px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/map-pattern.svg')] bg-center opacity-20"></div>
        </div>
        <div className="container relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-sm">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-secondary"></span>
                Nigeria&apos;s Official Geospatial Platform
              </div>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                National Geospatial Data Infrastructure Portal
              </h1>
              <p className="mb-8 text-lg text-primary-foreground/90 sm:text-xl">
                A centralized platform for accessing, managing, and sharing
                geospatial data across Nigeria. Empowering decision-makers with
                accurate spatial information.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link href="/">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white/10"
                      >
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-full max-w-md overflow-hidden rounded-lg shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 backdrop-blur-sm"></div>
                <Image
                  src="/images/stakeholders.gif"
                  alt="Nigeria Map Visualization"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-transparent p-6 text-white">
                  <p className="font-medium">
                    Stakeholders in the Geospatial Data Infrastructure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">250+</p>
              <p className="text-sm text-muted-foreground">Datasets</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">36</p>
              <p className="text-sm text-muted-foreground">States Covered</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-sm text-muted-foreground">Organizations</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">1000+</p>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Key Features
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Our platform provides comprehensive tools for geospatial data
              management and analysis.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Metadata Management
              </h3>
              <p className="text-muted-foreground">
                Create, edit, and manage comprehensive metadata records for
                geospatial datasets following international standards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Advanced Search
              </h3>
              <p className="text-muted-foreground">
                Find relevant geospatial data quickly with powerful search
                capabilities including spatial, temporal, and keyword filters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                User Management
              </h3>
              <p className="text-muted-foreground">
                Comprehensive user roles and permissions system to ensure secure
                access and data integrity across organizations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Data Sharing
              </h3>
              <p className="text-muted-foreground">
                Easily share geospatial data across departments and
                organizations with configurable access controls.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Standards Compliance
              </h3>
              <p className="text-muted-foreground">
                Full compliance with international geospatial metadata standards
                including ISO 19115 and FGDC.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Analytics & Reporting
              </h3>
              <p className="text-muted-foreground">
                Generate insights with built-in analytics and reporting tools to
                track data usage and quality metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by Organizations Across Nigeria
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              See what our users have to say about the NGDI Portal.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-primary/10">
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                    FM
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">
                    Federal Ministry of Environment
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Government Agency
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                &ldquo;The NGDI Portal has revolutionized how we manage and
                share environmental data across departments. The standardized
                metadata approach ensures consistency and reliability.&rdquo;
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-primary/10">
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                    NU
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">
                    National Universities Commission
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Education Sector
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                &ldquo;Access to standardized geospatial data has enhanced our
                research capabilities significantly. The platform&apos;s user
                management features make collaboration between institutions
                seamless.&rdquo;
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-primary/10">
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                    NG
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Nigerian Geological Survey</h4>
                  <p className="text-sm text-muted-foreground">
                    Research Institution
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                &ldquo;The advanced search capabilities have dramatically
                reduced the time it takes to find relevant geological datasets.
                This platform is an essential tool for our daily
                operations.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 shadow-xl sm:p-12">
            <div className="relative">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"></div>
              <div className="relative mx-auto max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to get started?
                </h2>
                <p className="mb-8 text-lg text-primary-foreground/90">
                  Join government agencies, research institutions, and private
                  organizations already using the NGDI Portal.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {isAuthenticated ? (
                    <Link href="/metadata">
                      <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/signin">
                        <Button
                          size="lg"
                          className="bg-white text-primary hover:bg-white/90"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/signup">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white text-white hover:bg-white/10"
                        >
                          Create Account
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
