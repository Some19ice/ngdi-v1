import { authService } from "../../../src/services/auth.service"
import { userRepository } from "../../../src/db/repositories/user.repository"
import { hashPassword, comparePassword } from "../../../src/utils/password"
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../src/utils/jwt"
import { ApiError } from "../../../src/middleware/error-handler"
import { UserRole } from "../../../src/types/auth.types"

// Mock dependencies
jest.mock("../../../src/db/repositories/user.repository")
jest.mock("../../../src/utils/password")
jest.mock("../../../src/utils/jwt")

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("login", () => {
    it("should login a user with valid credentials", async () => {
      // Arrange
      const mockUser = {
        id: "user-id",
        email: "test@example.com",
        password: "hashed-password",
        name: "Test User",
        role: "USER",
      }

      const loginData = {
        email: "test@example.com",
        password: "password123",
      }

      // Mock repository and utility functions
      jest.mocked(userRepository.findByEmail).mockResolvedValue(mockUser as any)
      jest.mocked(hashPassword).mockResolvedValue("hashed-password")
      jest.mocked(comparePassword).mockResolvedValue(true)
      jest.mocked(generateToken).mockResolvedValue("access-token")
      jest.mocked(generateRefreshToken).mockResolvedValue("refresh-token")

      // Act
      const result = await authService.login(loginData)

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginData.email)
      expect(comparePassword).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password
      )
      expect(generateToken).toHaveBeenCalled()
      expect(generateRefreshToken).toHaveBeenCalled()
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          organization: undefined,
          department: undefined,
        },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      })
    })

    it("should throw an error if user is not found", async () => {
      // Arrange
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      }

      // Mock repository to return null (user not found)
      jest.mocked(userRepository.findByEmail).mockResolvedValue(null)

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(ApiError)
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginData.email)
    })

    it("should throw an error if password is invalid", async () => {
      // Arrange
      const mockUser = {
        id: "user-id",
        email: "test@example.com",
        password: "hashed-password",
        name: "Test User",
        role: "USER",
      }

      const loginData = {
        email: "test@example.com",
        password: "wrong-password",
      }

      // Mock repository and utility functions
      jest.mocked(userRepository.findByEmail).mockResolvedValue(mockUser as any)
      jest.mocked(comparePassword).mockResolvedValue(false)

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(ApiError)
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginData.email)
      expect(comparePassword).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password
      )
    })
  })

  describe("register", () => {
    it("should register a new user successfully", async () => {
      // Arrange
      const registerData = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        organization: "Test Org",
        department: "Test Dept",
      }

      const mockCreatedUser = {
        id: "new-user-id",
        name: registerData.name,
        email: registerData.email,
        password: "hashed-password",
        role: UserRole.USER,
        organization: registerData.organization,
        department: registerData.department,
      }

      // Mock repository and utility functions
      jest.mocked(userRepository.findByEmail).mockResolvedValue(null)
      jest.mocked(hashPassword).mockResolvedValue("hashed-password")
      jest
        .mocked(userRepository.create)
        .mockResolvedValue(mockCreatedUser as any)
      jest.mocked(generateToken).mockResolvedValue("access-token")
      jest.mocked(generateRefreshToken).mockResolvedValue("refresh-token")

      // Act
      const result = await authService.register(registerData)

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerData.email
      )
      expect(hashPassword).toHaveBeenCalledWith(registerData.password)
      expect(userRepository.create).toHaveBeenCalled()
      expect(generateToken).toHaveBeenCalled()
      expect(generateRefreshToken).toHaveBeenCalled()
      expect(result).toEqual({
        user: {
          id: mockCreatedUser.id,
          name: mockCreatedUser.name,
          email: mockCreatedUser.email,
          role: mockCreatedUser.role,
          organization: mockCreatedUser.organization,
          department: mockCreatedUser.department,
        },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      })
    })

    it("should throw an error if email already exists", async () => {
      // Arrange
      const registerData = {
        name: "New User",
        email: "existing@example.com",
        password: "password123",
      }

      const existingUser = {
        id: "existing-id",
        email: registerData.email,
      }

      // Mock repository to return an existing user
      jest
        .mocked(userRepository.findByEmail)
        .mockResolvedValue(existingUser as any)

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(ApiError)
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerData.email
      )
    })
  })

  describe("refreshToken", () => {
    it("should refresh the access token with a valid refresh token", async () => {
      // Arrange
      const refreshToken = "valid-refresh-token"
      const decodedToken = {
        userId: "user-id",
        email: "test@example.com",
        role: UserRole.USER,
      }

      // Mock JWT verification
      jest.mocked(verifyRefreshToken).mockResolvedValue(decodedToken)
      jest.mocked(generateToken).mockResolvedValue("new-access-token")

      // Act
      const result = await authService.refreshToken(refreshToken)

      // Assert
      expect(verifyRefreshToken).toHaveBeenCalledWith(refreshToken)
      expect(generateToken).toHaveBeenCalledWith(decodedToken)
      expect(result).toEqual({
        accessToken: "new-access-token",
      })
    })

    it("should throw an error if refresh token is invalid", async () => {
      // Arrange
      const refreshToken = "invalid-refresh-token"

      // Mock JWT verification to throw an error
      jest
        .mocked(verifyRefreshToken)
        .mockRejectedValue(new Error("Invalid token"))

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        ApiError
      )
      expect(verifyRefreshToken).toHaveBeenCalledWith(refreshToken)
    })
  })
})
