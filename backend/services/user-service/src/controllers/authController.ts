// src/controllers/auth.js
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { GoogleAuthService } from '../services/googleAuth';
import User from '../models/User';
import { config } from '../config';

const googleAuthService = new GoogleAuthService();

// Traditional email/password registration
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const user = await AuthService.registerUser(email, password, name);
    const tokens = AuthService.generateTokens(user);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.server.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      user,
      accessToken: tokens.accessToken
    });
  } catch (error: any) {
    console.error(error)
    res.status(400).json({ error: error.message });
  }
};

// Traditional email/password login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await AuthService.loginUser(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.server.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user,
      accessToken: tokens.accessToken
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

// Google OAuth initiation
export const googleAuth = (req: Request, res: Response) => {
  try {
    const authUrl = googleAuthService.generateAuthUrl();
    res.redirect(authUrl);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

// Google OAuth callback
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(`${config.urls.frontend}/auth/error?error=oauth_denied`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${config.urls.frontend}/auth/error?error=no_code`);
    }

    // Exchange code for tokens
    const tokens = await googleAuthService.getTokens(code);
    if (!tokens.access_token) {
      return res.redirect(`${config.urls.frontend}/auth/error?error=no_access_token`);
    }

    // Get user info
    const googleUser = await googleAuthService.getUserInfo(tokens.access_token);
    if (!googleUser.id || !googleUser.email) {
      return res.redirect(`${config.urls.frontend}/auth/error?error=no_user_info`);
    }

    // Find or create user
    let user = await User.findOne({ googleId: googleUser.id });
    let isNewUser = false;

    if (user) {
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Check if email already exists
      const existingUser = await User.findOne({ email: googleUser.email });
      if (existingUser) {
        existingUser.googleId = googleUser.id;
        existingUser.avatar = googleUser.picture || existingUser.avatar;
        existingUser.lastLogin = new Date();
        user = existingUser;
        await user.save();
      } else {
        user = new User({
          googleId: googleUser.id,
          email: googleUser.email!,
          name: googleUser.name || 'Google User',
          avatar: googleUser.picture,
          isVerified: true,
          plan: 'free',
          apiCallsUsed: 0,
          apiCallsLimit: 1000
        });
        await user.save();
        isNewUser = true;
      }
    }

    // Generate our JWT tokens
    const authTokens = AuthService.generateTokens(user);

    // Set refresh token cookie
    res.cookie('refreshToken', authTokens.refreshToken, {
      httpOnly: true,
      secure: config.server.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect to frontend with access token
    const redirectUrl = isNewUser 
      ? `${config.urls.frontend}/auth/success?token=${authTokens.accessToken}&newUser=true`
      : `${config.urls.frontend}/auth/success?token=${authTokens.accessToken}`;
    
    res.redirect(redirectUrl);

  } catch (error: any) {
    console.error('Google auth callback error:', error);
    res.redirect(`${config.urls.frontend}/auth/error?error=callback_failed`);
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not provided' });
    }

    const tokens = await AuthService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.server.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (error: any) {
    console.log(error)
    res.status(401).json({ error: error.message });
  }
};

// Logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout successful' });
};

// Auth status check
export const getAuthStatus = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ authenticated: false });
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyAccessToken(token);
    if (!payload) {
      return res.json({ authenticated: false });
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        apiCallsUsed: user.apiCallsUsed,
        apiCallsLimit: user.apiCallsLimit
      }
    });
  } catch (error) {
    res.json({ authenticated: false });
  }
};
