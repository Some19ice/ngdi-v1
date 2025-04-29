"use client"

import { useState } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { PermissionEnum } from "@/lib/auth/auth-types"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { 
  InfoIcon, 
  ShieldIcon, 
  UserIcon, 
  KeyIcon, 
  RefreshCwIcon,
  LogOutIcon,
  CheckCircleIcon,
  XCircleIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

/**
 * Enhanced Auth Test Page
 * This page demonstrates the enhanced auth hook with improved type safety and performance
 */
export default function EnhancedAuthTestPage() {
  const { 
    user, 
    session, 
    status, 
    isAuthenticated, 
    isAdmin, 
    isNodeOfficer,
    hasPermission,
    getUserPermissions,
    refreshSession,
    logout,
    isLoading,
    error
  } = useAuthSession()
  
  const [activeTab, setActiveTab] = useState("session")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Handle session refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Handle logout
  const handleLogout = async () => {
    await logout()
  }
  
  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Enhanced Auth Test</h1>
      
      <div className="grid gap-6">
        {/* Auth Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5" />
              Authentication Status
            </CardTitle>
            <CardDescription>
              Current authentication state with type-safe status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <Badge variant={
                  status === "authenticated" ? "success" : 
                  status === "loading" ? "outline" : 
                  status === "error" ? "destructive" : 
                  "secondary"
                }>
                  {status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold">Authenticated:</span>
                {isAuthenticated ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>
                    {error.message}
                    {error.code && <div className="text-sm mt-1">Code: {error.code}</div>}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing || !isAuthenticated}
            >
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Session
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleLogout} 
              disabled={!isAuthenticated}
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardFooter>
        </Card>
        
        {/* User and Session Details */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Authentication Details</CardTitle>
              <CardDescription>
                Detailed information about the current authentication session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="user">
                    <UserIcon className="h-4 w-4 mr-2" />
                    User
                  </TabsTrigger>
                  <TabsTrigger value="session">
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Session
                  </TabsTrigger>
                  <TabsTrigger value="permissions">
                    <ShieldIcon className="h-4 w-4 mr-2" />
                    Permissions
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="user" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-semibold">ID:</div>
                    <div className="font-mono text-sm">{user?.id}</div>
                    
                    <div className="font-semibold">Email:</div>
                    <div>{user?.email}</div>
                    
                    <div className="font-semibold">Name:</div>
                    <div>{user?.name || "N/A"}</div>
                    
                    <div className="font-semibold">Role:</div>
                    <div>
                      <Badge>{user?.role}</Badge>
                    </div>
                    
                    <div className="font-semibold">Email Verified:</div>
                    <div>
                      {user?.emailVerified ? (
                        <span className="text-green-500 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {formatDate(user.emailVerified.toISOString())}
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Not verified
                        </span>
                      )}
                    </div>
                    
                    <div className="font-semibold">Organization:</div>
                    <div>{user?.organization || "N/A"}</div>
                    
                    <div className="font-semibold">Department:</div>
                    <div>{user?.department || "N/A"}</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="session" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-semibold">Access Token:</div>
                    <div className="font-mono text-xs truncate">
                      {session?.accessToken.substring(0, 20)}...
                    </div>
                    
                    <div className="font-semibold">Refresh Token:</div>
                    <div className="font-mono text-xs truncate">
                      {session?.refreshToken.substring(0, 20)}...
                    </div>
                    
                    <div className="font-semibold">Expires At:</div>
                    <div>{formatDate(session?.expiresAt)}</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-semibold">Is Admin:</div>
                        <div>
                          {isAdmin() ? (
                            <Badge variant="success">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </div>
                        
                        <div className="font-semibold">Is Node Officer:</div>
                        <div>
                          {isNodeOfficer() ? (
                            <Badge variant="success">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Permission Checks</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-semibold">Create Metadata:</div>
                        <div>
                          {hasPermission(PermissionEnum.CREATE_METADATA) ? (
                            <Badge variant="success">Allowed</Badge>
                          ) : (
                            <Badge variant="secondary">Denied</Badge>
                          )}
                        </div>
                        
                        <div className="font-semibold">Read Metadata:</div>
                        <div>
                          {hasPermission(PermissionEnum.READ_METADATA) ? (
                            <Badge variant="success">Allowed</Badge>
                          ) : (
                            <Badge variant="secondary">Denied</Badge>
                          )}
                        </div>
                        
                        <div className="font-semibold">Update Metadata:</div>
                        <div>
                          {hasPermission(PermissionEnum.UPDATE_METADATA) ? (
                            <Badge variant="success">Allowed</Badge>
                          ) : (
                            <Badge variant="secondary">Denied</Badge>
                          )}
                        </div>
                        
                        <div className="font-semibold">Delete Metadata:</div>
                        <div>
                          {hasPermission(PermissionEnum.DELETE_METADATA) ? (
                            <Badge variant="success">Allowed</Badge>
                          ) : (
                            <Badge variant="secondary">Denied</Badge>
                          )}
                        </div>
                        
                        <div className="font-semibold">Manage Organization:</div>
                        <div>
                          {hasPermission(PermissionEnum.MANAGE_ORGANIZATION) ? (
                            <Badge variant="success">Allowed</Badge>
                          ) : (
                            <Badge variant="secondary">Denied</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">All Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        {getUserPermissions().map((permission) => (
                          <Badge key={permission} variant="outline">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
        
        {/* Not Authenticated State */}
        {!isAuthenticated && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Not Authenticated</CardTitle>
              <CardDescription>
                You are not currently authenticated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Please sign in to view authentication details
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.href = "/auth/signin"}>
                Sign In
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Loading Authentication State</CardTitle>
              <CardDescription>
                Please wait while we load your authentication state
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
