import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapIcon, Search, Upload, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="relative isolate">
      {/* Hero section */}
      <div className="relative pt-14">
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Nigeria's Geospatial Data Infrastructure Portal
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Discover, share, and manage geospatial data across Nigeria. A comprehensive platform for government agencies, researchers, and the public.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg">
                  <Link href="/search">
                    Explore Data
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/metadata/add">
                    Contribute Data
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Platform Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to work with geospatial data
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                <Search className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                Advanced Search
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                <p className="flex-auto">
                  Powerful search capabilities with multi-criteria filtering and geospatial queries.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                <Upload className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                Metadata Management
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                <p className="flex-auto">
                  Standardized metadata creation and management system with quality control.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                <Users className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                User Management
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                <p className="flex-auto">
                  Secure authentication and role-based access control for different user types.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}