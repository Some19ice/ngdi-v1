import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function HomePage() {
  // Check if user is authenticated
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth_token")

  // If not authenticated, redirect to sign-in
  if (!authToken) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Welcome to NGDI Portal</h1>
          <p className="text-muted-foreground">
            Nigeria Geospatial Data Infrastructure Portal
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Metadata Management</CardTitle>
              <CardDescription>
                Create, view, and manage metadata records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Access and manage geospatial metadata records.</p>
            </CardContent>
            <CardFooter>
              <Link href="/metadata" className="w-full">
                <Button className="w-full">Go to Metadata</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Administer user accounts and access controls.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/users" className="w-full">
                <Button className="w-full" variant="outline">
                  Go to Users
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Adjust system settings and configurations.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/settings" className="w-full">
                <Button className="w-full" variant="outline">
                  Go to Settings
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
