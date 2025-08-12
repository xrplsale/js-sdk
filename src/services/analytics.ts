import { AxiosInstance } from 'axios';
import { Analytics, ProjectAnalytics } from '../types';

/**
 * Service for analytics and reporting
 */
export class AnalyticsService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * Get platform-wide analytics
   */
  async getPlatformAnalytics(): Promise<Analytics> {
    const response = await this.httpClient.get('/analytics/platform');
    return response.data;
  }

  /**
   * Get analytics for a specific project
   */
  async getProjectAnalytics(projectId: string, options?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<ProjectAnalytics> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.granularity) params.append('granularity', options.granularity);

    const response = await this.httpClient.get(`/analytics/projects/${projectId}?${params.toString()}`);
    return response.data;
  }

  /**
   * Get investor analytics
   */
  async getInvestorAnalytics(investorAccount: string): Promise<{
    totalInvested: string;
    projectCount: number;
    averageInvestment: string;
    tier: {
      current: string;
      multiplier: number;
      nextTierRequirement?: string;
    };
    investmentHistory: {
      date: string;
      projectId: string;
      projectName: string;
      amount: string;
    }[];
  }> {
    const response = await this.httpClient.get(`/analytics/investors/${investorAccount}`);
    return response.data;
  }

  /**
   * Get market trends and statistics
   */
  async getMarketTrends(period: '24h' | '7d' | '30d' | '90d' = '30d'): Promise<{
    totalVolume: string;
    averageProjectSize: string;
    successRate: number;
    topPerformingProjects: {
      id: string;
      name: string;
      raised: string;
      target: string;
      completionRate: number;
    }[];
    investmentTrends: {
      date: string;
      volume: string;
      projectCount: number;
      investorCount: number;
    }[];
  }> {
    const response = await this.httpClient.get(`/analytics/trends?period=${period}`);
    return response.data;
  }

  /**
   * Get tier system analytics
   */
  async getTierAnalytics(): Promise<{
    tierDistribution: {
      tier: string;
      userCount: number;
      totalHoldings: string;
      averageHolding: string;
    }[];
    tierPerformance: {
      tier: string;
      totalInvested: string;
      averageInvestment: string;
      projectsParticipated: number;
    }[];
  }> {
    const response = await this.httpClient.get('/analytics/tiers');
    return response.data;
  }

  /**
   * Export analytics data
   */
  async exportData(options: {
    type: 'projects' | 'investments' | 'investors' | 'platform';
    format: 'csv' | 'json' | 'xlsx';
    startDate?: string;
    endDate?: string;
    projectId?: string;
  }): Promise<{
    downloadUrl: string;
    expiresAt: string;
  }> {
    const response = await this.httpClient.post('/analytics/export', options);
    return response.data;
  }
}