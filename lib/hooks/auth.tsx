import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth.service"
import { UserProfile } from "@/types/user"
import { LoginRequest, RegisterRequest } from "@/types/auth"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const refreshToken = useCallback(async () => {
    try {
      const token = await authService.refreshToken()
      localStorage.setItem("token", token)
    } catch (error) {
      localStorage.removeItem("token")
      setUser(null)
      router.push("/login")
    }
  }, [router, setUser])

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await refreshToken()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [refreshToken, setIsLoading])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data)
      localStorage.setItem("token", response.token)
      setUser(response.user)
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials",
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data)
      localStorage.setItem("token", response.token)
      setUser(response.user)
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      localStorage.removeItem("token")
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
