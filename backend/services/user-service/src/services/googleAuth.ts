import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { config } from '../config';

export class GoogleAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
  }

  // Generate auth URL
  generateAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent'
    });
  }

  // Exchange code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Get user info from Google
  async getUserInfo(accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({
      auth: this.oauth2Client,
      version: 'v2'
    });

    const { data } = await oauth2.userinfo.get();
    return data;
  }

  // Verify Google token
  async verifyToken(token: string) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: token,
        audience: config.google.clientId
      });
      return ticket.getPayload();
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }
}
