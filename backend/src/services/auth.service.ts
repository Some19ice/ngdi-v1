import { userRepository } from '../db/repositories/user.repository';
import { ApiError, ErrorCode } from '../middleware/error-handler';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken, generateRefreshToken, JwtPayload } from '../utils/jwt';
import { LoginRequest, RegisterRequest, AuthResponse, UserRole } from '../types/auth.types';
import { prisma } from '../db/client';
import { randomUUID } from 'crypto';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login a user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const { email, password } = data;
    
    // Find user by email
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new ApiError(
        'Invalid email or password',
        401,
        ErrorCode.AUTHENTICATION_ERROR
      );
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new ApiError(
        'Invalid email or password',
        401,
        ErrorCode.AUTHENTICATION_ERROR
      );
    }
    
    // Generate tokens
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = await generateToken(payload);
    const refreshToken = await generateRefreshToken(payload);
    
    return {
      user: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        role: user.role as UserRole,
        organization: user.organization || undefined,
        department: user.department || undefined,
      },
      accessToken,
      refreshToken,
    };
  },
  
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const { email, password, name, organization, department, phone } = data;
    
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    
    if (existingUser) {
      throw new ApiError(
        'Email already in use',
        409,
        ErrorCode.VALIDATION_ERROR
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await userRepository.create({
      id: randomUUID(),
      email,
      password: hashedPassword,
      name,
      organization,
      department,
      phone,
      role: UserRole.USER,
    });
    
    // Generate tokens
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = await generateToken(payload);
    const refreshToken = await generateRefreshToken(payload);
    
    return {
      user: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        role: user.role as UserRole,
        organization: user.organization || undefined,
        department: user.department || undefined,
      },
      accessToken,
      refreshToken,
    };
  },
  
  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    try {
      // Verify refresh token
      const payload = await prisma.$transaction(async (tx) => {
        // Verify refresh token
        const payload = await import('../utils/jwt').then(({ verifyRefreshToken }) => 
          verifyRefreshToken(refreshToken)
        );
        
        // Check if user exists
        const user = await tx.user.findUnique({
          where: { id: payload.id },
        });
        
        if (!user) {
          throw new ApiError(
            'Invalid refresh token',
            401,
            ErrorCode.AUTHENTICATION_ERROR
          );
        }
        
        return payload;
      });
      
      // Generate new access token
      const accessToken = await generateToken(payload);
      
      return { accessToken };
    } catch (error) {
      throw new ApiError(
        'Invalid refresh token',
        401,
        ErrorCode.AUTHENTICATION_ERROR
      );
    }
  },
  
  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<void> => {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      // Don't reveal that the email doesn't exist
      return;
    }
    
    // Generate reset token
    const token = randomUUID();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
    
    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    
    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${token}`);
  },
  
  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    // Find token in database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      throw new ApiError(
        'Invalid or expired token',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }
    
    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      throw new ApiError(
        'Token has expired',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }
    
    // Find user by email
    const user = await userRepository.findByEmail(verificationToken.identifier);
    
    if (!user) {
      throw new ApiError(
        'User not found',
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password
    await userRepository.update(user.id, {
      password: hashedPassword,
    });
    
    // Delete used token
    await prisma.verificationToken.delete({
      where: { token },
    });
  },
  
  /**
   * Verify email address
   */
  verifyEmail: async (token: string): Promise<void> => {
    // Find token in database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      throw new ApiError(
        'Invalid or expired token',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }
    
    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      throw new ApiError(
        'Token has expired',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }
    
    // Find user by email
    const user = await userRepository.findByEmail(verificationToken.identifier);
    
    if (!user) {
      throw new ApiError(
        'User not found',
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }
    
    // Update user email verification status
    await userRepository.update(user.id, {
      emailVerified: new Date(),
    });
    
    // Delete used token
    await prisma.verificationToken.delete({
      where: { token },
    });
  },
}; 