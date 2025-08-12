import { AxiosInstance } from 'axios';
import { AuthRequest, AuthResponse } from '../types';

/**
 * Service for authentication and authorization
 */
export class AuthService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * Authenticate with XRPL wallet signature
   */
  async authenticate(authData: AuthRequest): Promise<AuthResponse> {
    const response = await this.httpClient.post('/auth/wallet', authData);
    return response.data;
  }

  /**
   * Refresh authentication token
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await this.httpClient.post('/auth/refresh', {
      refreshToken
    });
    return response.data;
  }

  /**
   * Logout and invalidate token
   */
  async logout(): Promise<{ success: boolean }> {
    const response = await this.httpClient.post('/auth/logout');
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{
    walletAddress: string;
    tier: {
      level: string;
      multiplier: number;
      earlyAccessHours: number;
      guaranteedAllocation: boolean;
    };
    totalInvested: string;
    projectsParticipated: number;
    joinedAt: string;
  }> {
    const response = await this.httpClient.get('/auth/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    email?: string;
    notifications?: {
      email: boolean;
      webhook: boolean;
      sms: boolean;
    };
    preferences?: Record<string, any>;
  }): Promise<{ success: boolean }> {
    const response = await this.httpClient.patch('/auth/profile', updates);
    return response.data;
  }

  /**
   * Generate authentication challenge for wallet signing
   */
  async generateChallenge(walletAddress: string): Promise<{
    challenge: string;
    timestamp: number;
    expiresAt: number;
  }> {
    const response = await this.httpClient.post('/auth/challenge', {
      walletAddress
    });
    return response.data;
  }

  /**
   * Verify wallet ownership
   */
  async verifyWallet(verificationData: {
    walletAddress: string;
    signature: string;
    message: string;
  }): Promise<{ verified: boolean }> {
    const response = await this.httpClient.post('/auth/verify', verificationData);
    return response.data;
  }

  /**
   * Get user permissions
   */
  async getPermissions(): Promise<{
    canCreateProjects: boolean;
    canInvest: boolean;
    canManageWebhooks: boolean;
    maxProjectsPerMonth: number;
    maxInvestmentPerProject: string;
  }> {
    const response = await this.httpClient.get('/auth/permissions');
    return response.data;
  }
}