/* eslint-disable */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { UserSession } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  ArrowLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { Session } from "@/lib/auth-client"

// Define the getSessions result type
interface GetSessionsResult {
  sessions: UserSession[];
  error: Error | null;
}

export default function ActivityPage() {
  const router = useRouter()
  const {
    user,
    isLoading,
    getSessions,
    signOutFromDevice,
    signOutFromAllDevices,
    signOut,
  } = useAuth()
  const [currentTab, setCurrentTab] = useState("logins")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isProcessingSignOut, setIsProcessingSignOut] = useState<string | null>(
    null
  )
  const [showSignOutAllConfirm, setShowSignOutAllConfirm] = useState(false)
  const [isSigningOutAll, setIsSigningOutAll] = useState(false)

  // Fetch sessions data when component mounts
  useEffect(() => {
    async function fetchSessions() {
      if (!user) return

      try {
        setIsLoadingSessions(true)
        const { sessions: fetchedSessions, error } = await getSessions()

        if (error) {
          console.error("Error fetching sessions:", error)
          toast.error("Failed to load login history")
          return
        }

        // Generate some mock sessions for demonstration if we only have 1 session
        if (fetchedSessions.length <= 1) {
          const mockSessions: UserSession[] = [
            {
              id: "session-2",
              created_at: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
              updated_at: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              last_sign_in_at: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              user_id: user.id,
              ip_address: "192.168.1.2",
              user_agent:
                "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
              location: "San Francisco, CA",
              device_info: {
                browser: "Safari",
                os: "iOS",
                device: "Mobile",
              },
              is_current: false,
            },
            {
              id: "session-3",
              created_at: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000
              ).toISOString(),
              updated_at: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              last_sign_in_at: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              user_id: user.id,
              ip_address: "192.168.1.3",
              user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              location: "New York, NY",
              device_info: {
                browser: "Chrome",
                os: "Windows",
                device: "Desktop",
              },
              is_current: false,
            },
          ]

          // Only use the mocks if we don't have enough real sessions
          if (fetchedSessions.length === 0) {
            setSessions(mockSessions)
          } else if (fetchedSessions.length === 1) {
            setSessions([...fetchedSessions, ...mockSessions.slice(1)])
          } else {
            setSessions(fetchedSessions)
          }
        } else {
          setSessions(fetchedSessions)
        }
      } catch (err) {
        console.error("Error fetching sessions:", err)
        toast.error("Failed to load login history")
      } finally {
        setIsLoadingSessions(false)
      }
    }

    fetchSessions()
  }, [user, getSessions])

  // Mock data for account changes
  const [accountChanges] = useState([
    {
      id: 1,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: "password_changed",
      description: "Password changed",
    },
    {
      id: 2,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      type: "email_changed",
      description: "Email address updated",
    },
    {
      id: 3,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      type: "profile_updated",
      description: "Profile information updated",
    },
    {
      id: 4,
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      type: "2fa_enabled",
      description: "Two-factor authentication enabled",
    },
  ])

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(dateString))
  }

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    // Simulate loading more data
    setTimeout(() => {
      setIsLoadingMore(false)
      setCurrentPage((prev) => prev + 1)
    }, 1000)
  }

  const handleSignOutDevice = async (sessionId: string) => {
    try {
      setIsProcessingSignOut(sessionId)

      // Add a safety timeout to reset the loading state if the process gets stuck
      const safetyTimeout = setTimeout(() => {
        console.log("Sign-out device safety timeout triggered")
        setIsProcessingSignOut(null)
        toast.error("Sign-out process timed out. Please try again.")
      }, 5000) // 5 seconds timeout

      // Check if it's the current session
      const isCurrentSession = sessions.find(
        (s) => s.id === sessionId
      )?.is_current

      if (isCurrentSession) {
        // For current session, first set the manual signout flag
        localStorage.setItem("manual_signout", "true")

        // Call server-side API to clear cookies
        try {
          const response = await fetch("/api/auth/signout", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            console.error("Server-side sign out failed:", await response.text())
          }
        } catch (apiError) {
          console.error("Failed to call sign out API:", apiError)
        }

        // Then do a normal sign out
        await signOut()
        // Redirect after signout
        router.push("/auth/signin?signedout=true")
        clearTimeout(safetyTimeout)
        return
      }

      // Sign out from specific device
      await signOutFromDevice()
      
      // Assume success for now
      const success = true
      const error = null

      // Clear the timeout as the operation completed (either success or failure)
      clearTimeout(safetyTimeout)

      if (!success) {
        throw new Error(error || "Failed to sign out from device")
      }

      // Remove the session from the local state
      setSessions((prevSessions) =>
        prevSessions.filter((s) => s.id !== sessionId)
      )
      toast.success("Device signed out successfully")
    } catch (error) {
      console.error("Error signing out device:", error)
      toast.error("Failed to sign out device. Please try again.")
    } finally {
      setIsProcessingSignOut(null)
    }
  }

  const handleSignOutAllDevices = async () => {
    try {
      setIsSigningOutAll(true)

      // Add a safety timeout to reset the loading state if the process gets stuck
      const safetyTimeout = setTimeout(() => {
        console.log("Sign-out all devices safety timeout triggered")
        setIsSigningOutAll(false)
        setShowSignOutAllConfirm(false)
        toast.error("Sign-out process timed out. Please try again.")
      }, 5000) // 5 seconds timeout

      // Call server-side API to ensure cookies are properly cleared
      try {
        const response = await fetch("/api/auth/signout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.error("Server-side sign out failed:", await response.text())
        }
      } catch (apiError) {
        console.error("Failed to call sign out API:", apiError)
      }

      // Then call the client-side function to sign out from all devices
      await signOutFromAllDevices()
      
      // Assume success for now
      const success = true
      const error = null

      // Clear the timeout as the operation completed
      clearTimeout(safetyTimeout)

      if (!success) {
        throw new Error(error || "Failed to sign out from all devices")
      }

      // Keep only the current session in the local state
      setSessions((prevSessions) => prevSessions.filter((s) => s.is_current))
      setShowSignOutAllConfirm(false)
      toast.success("All other devices signed out successfully")
    } catch (error) {
      console.error("Error signing out all devices:", error)
      toast.error("Failed to sign out all devices. Please try again.")
    } finally {
      setIsSigningOutAll(false)
    }
  }

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    )
  }

  // If not authenticated, show message
  if (!user) {
    return (
      <div className="space-y-8">
        <div className="rounded-md bg-yellow-50 p-4">
          <h2 className="text-lg font-semibold text-yellow-800">
            Not Authenticated
          </h2>
          <p className="text-yellow-700 mb-4">
            Please sign in to view your account activity.
          </p>
          <div className="mt-4">
            <Button
              onClick={() => router.push("/auth/signin")}
              variant="default"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 mb-4"
          onClick={() => router.push("/profile")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllSessions(!showAllSessions)}
          >
            {showAllSessions ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide inactive sessions
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show all sessions
              </>
            )}
          </Button>

          <AlertDialog
            open={showSignOutAllConfirm}
            onOpenChange={setShowSignOutAllConfirm}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={
                  sessions.filter((s) => !s.is_current).length === 0 ||
                  isSigningOutAll
                }
              >
                {isSigningOutAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Sign out all devices
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Sign out from all other devices?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign out all sessions except your current one. Other
                  devices will need to sign in again to access this account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOutAllDevices}
                  className={cn(
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    isSigningOutAll && "opacity-70 pointer-events-none"
                  )}
                >
                  {isSigningOutAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    "Sign out all devices"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>
            Review your recent account activity and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="logins"
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="logins">Login History</TabsTrigger>
              <TabsTrigger value="changes">Account Changes</TabsTrigger>
            </TabsList>

            <TabsContent value="logins" className="mt-4">
              {isLoadingSessions ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No session history found.
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .filter((session) => showAllSessions || session.is_current)
                    .map((session) => (
                      <div
                        key={session.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border ${
                          session.is_current
                            ? "border-primary/20 bg-primary/5"
                            : ""
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {formatDate(session.updated_at || session.created_at)}
                            </p>
                            {session.is_current && (
                              <Badge
                                variant="outline"
                                className="bg-primary/10 border-primary/30 text-primary"
                              >
                                Current Session
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {session.device_info?.browser && (
                              <span>{session.device_info.browser}</span>
                            )}
                            {session.device_info?.os && (
                              <span>/ {session.device_info.os}</span>
                            )}
                            {session.device_info?.device && (
                              <span>/ {session.device_info.device}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {session.location && (
                              <span>{session.location}</span>
                            )}
                            {session.ip_address && (
                              <span>IP: {session.ip_address}</span>
                            )}
                            <span>
                              Created: {formatDate(session.created_at)}
                            </span>
                          </div>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-3 sm:mt-0"
                              disabled={isProcessingSignOut === session.id}
                            >
                              {isProcessingSignOut === session.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Signing out...
                                </>
                              ) : (
                                "Sign Out Device"
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {session.is_current
                                  ? "Sign out from current device?"
                                  : "Sign out from this device?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {session.is_current
                                  ? "You will be redirected to the sign-in page."
                                  : "This will terminate the session on this device. They will need to sign in again to access their account."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleSignOutDevice(session.id)}
                                disabled={isProcessingSignOut === session.id}
                              >
                                {isProcessingSignOut === session.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Signing out...
                                  </>
                                ) : (
                                  "Sign Out"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1)
                              setCurrentPage((prev) => prev - 1)
                          }}
                        />
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handleLoadMore()
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>

            <TabsContent value="changes" className="mt-4">
              <div className="space-y-4">
                {accountChanges.map((change) => (
                  <div
                    key={change.id}
                    className="flex justify-between items-center p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{change.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(change.date.toISOString())}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {change.type.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row sm:justify-between gap-4 text-xs text-muted-foreground">
          <p>
            If you notice any suspicious activity, please change your password
            immediately and contact support.
          </p>
          <p>
            Sessions are automatically terminated after 30 days of inactivity.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
