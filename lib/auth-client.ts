import axios from "axios";
import * as jose from "jose";

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image?: string | null;
}

export interface Session {
  user: User | null;
  expires: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const TOKEN_KEY = "auth_tokens";

// Helper functions
function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  
  const tokensStr = localStorage.getItem(TOKEN_KEY);
  if (!tokensStr) return null;
  
  try {
    return JSON.parse(tokensStr) as AuthTokens;
  } catch (error) {
    console.error("Failed to parse auth tokens:", error);
    return null;
  }
}

function setTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

async function decodeJwt(token: string): Promise<{ exp: number }> {
  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode("secret"), // This is just for decoding, not verification
      { 
        requiredClaims: ["exp"],
        algorithms: ["HS256"]
      }
    );
    return { exp: payload.exp as number };
  } catch (error) {
    // If verification fails, just decode without verification
    const decoded = jose.decodeJwt(token);
    return { exp: decoded.exp as number };
  }
}

async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const decoded = await decodeJwt(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

// Auth client
export const authClient = {
  async login(email: string, password: string): Promise<Session> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Decode token to get expiry
      const decoded = await decodeJwt(accessToken);
      
      setTokens({
        accessToken,
        refreshToken,
        expiresAt: decoded.exp,
      });
      
      return {
        user,
        expires: new Date(decoded.exp * 1000).toISOString(),
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || "Authentication failed. Please check your credentials.";
      
      // Create a more informative error
      const enhancedError = new Error(errorMessage);
      enhancedError.name = "AuthenticationError";
      
      throw enhancedError;
    }
  },
  
  async register(email: string, password: string, name?: string): Promise<Session> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
      });
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Decode token to get expiry
      const decoded = await decodeJwt(accessToken);
      
      setTokens({
        accessToken,
        refreshToken,
        expiresAt: decoded.exp,
      });
      
      return {
        user,
        expires: new Date(decoded.exp * 1000).toISOString(),
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.error("Registration failed:", error);
      
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      
      // Create a more informative error
      const enhancedError = new Error(errorMessage);
      enhancedError.name = "RegistrationError";
      
      throw enhancedError;
    }
  },
  
  async logout(): Promise<void> {
    try {
      const tokens = getTokens();
      if (tokens) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearTokens();
    }
  },
  
  async refreshToken(): Promise<AuthTokens | null> {
    const tokens = getTokens();
    if (!tokens) return null;
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken: tokens.refreshToken,
      });
      
      const { accessToken, refreshToken } = response.data;
      
      // Decode token to get expiry
      const decoded = await decodeJwt(accessToken);
      
      const newTokens = {
        accessToken,
        refreshToken,
        expiresAt: decoded.exp,
      };
      
      setTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearTokens();
      return null;
    }
  },
  
  async getSession(): Promise<Session | null> {
    const tokens = getTokens();
    if (!tokens) return null;
    
    // Check if token is expired
    if (await isTokenExpired(tokens.accessToken)) {
      const newTokens = await this.refreshToken();
      if (!newTokens) return null;
    }
    
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      
      return {
        user: response.data,
        expires: new Date(tokens.expiresAt * 1000).toISOString(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error("Failed to get user session:", error);
      return null;
    }
  },
  
  getAccessToken(): string | null {
    const tokens = getTokens();
    return tokens?.accessToken || null;
  },
  
  async isAuthenticated(): Promise<boolean> {
    const tokens = getTokens();
    return !!tokens && !(await isTokenExpired(tokens.accessToken));
  },
};

// Create an axios instance with auth headers
export const authAxios = axios.create({
  baseURL: API_URL,
});

// Add interceptor to handle token refresh
authAxios.interceptors.request.use(async (config) => {
  let tokens = getTokens();
  
  if (tokens && await isTokenExpired(tokens.accessToken)) {
    tokens = await authClient.refreshToken();
  }
  
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  
  return config;
}); 