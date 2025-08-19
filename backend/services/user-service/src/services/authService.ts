// src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken'; // 👈 Import Secret type
import { config } from '../config';
import User, { IUser } from '../models/User';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  plan: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT tokens
  static generateTokens(user: IUser): AuthTokens {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      plan: user.plan
    };

    // Type assertion to ensure secret is not undefined
    const accessToken = jwt.sign(
      payload, 
      config.jwt.secret as Secret, 
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    const refreshToken = jwt.sign(
      payload, 
      config.jwt.refreshSecret as Secret, 
      { expiresIn: config.jwt.refreshExpiresIn } as SignOptions 
    );

    return { accessToken, refreshToken };
  }

  // Verify access token
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, config.jwt.secret as Secret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, config.jwt.refreshSecret as Secret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Register user with email/password
  static async registerUser(email: string, password: string, name: string): Promise<IUser> {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      isVerified: true // In V1, auto-verify. Later add email verification
    });

    await user.save();
    return user;
  }

  // Login user with email/password
  static async loginUser(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user has password (OAuth users might not)
    if (!user.password) {
      throw new Error('Please login with Google');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found');
    }

    return this.generateTokens(user);
  }
}
