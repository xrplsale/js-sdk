/**
 * Core types and interfaces for XRPL.Sale SDK
 */

export type Environment = 'production' | 'testnet';

export interface XRPLSaleConfig {
  apiKey: string;
  environment?: Environment;
  timeout?: number;
  debug?: boolean;
  webhookSecret?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tokenSymbol: string;
  totalSupply: string;
  saleSupply: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  saleStartDate: string;
  saleEndDate: string;
  tiers: ProjectTier[];
  currentTier: number;
  totalRaised: string;
  investorCount: number;
  isActive: boolean;
}

export type ProjectStatus = 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';

export interface ProjectTier {
  tier: number;
  pricePerToken: string;
  totalTokens: string;
  tokensRemaining: string;
  minInvestment?: string;
  maxInvestment?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  tokenSymbol: string;
  totalSupply: string;
  tiers: Omit<ProjectTier, 'tokensRemaining'>[];
  saleStartDate: Date | string;
  saleEndDate: Date | string;
  metadata?: Record<string, any>;
}

export interface Investment {
  id: string;
  projectId: string;
  investorAccount: string;
  amountXRP: string;
  tokenAmount: string;
  status: InvestmentStatus;
  transactionHash: string;
  tier: number;
  createdAt: string;
  confirmedAt?: string;
}

export type InvestmentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface Analytics {
  totalRaisedXRP: string;
  totalProjects: number;
  activeProjects: number;
  totalInvestors: number;
  averageInvestment: string;
  topProjects: Project[];
  recentInvestments: Investment[];
}

export interface ProjectAnalytics {
  projectId: string;
  totalRaisedXRP: string;
  investorCount: number;
  currentTier: number;
  completionPercentage: number;
  tierDistribution: {
    tier: number;
    amountRaised: string;
    investorCount: number;
  }[];
  dailyInvestments: {
    date: string;
    amount: string;
    count: number;
  }[];
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  timestamp: string;
  version: string;
}

export type WebhookEventType = 
  | 'project.created'
  | 'project.updated'
  | 'project.launched'
  | 'project.completed'
  | 'investment.created'
  | 'investment.confirmed'
  | 'investment.failed'
  | 'tier.completed'
  | 'tokens.distributed';

export interface AuthRequest {
  walletAddress: string;
  signature: string;
  timestamp: number;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  userTier: {
    tier: string;
    multiplier: number;
    earlyAccess: number;
    guaranteed: boolean;
  };
}

export interface ListProjectsOptions {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  sortBy?: 'createdAt' | 'name' | 'totalRaised';
  sortOrder?: 'asc' | 'desc';
}

export interface ListInvestmentsOptions {
  page?: number;
  limit?: number;
  projectId?: string;
  investorAccount?: string;
  status?: InvestmentStatus;
  sortBy?: 'createdAt' | 'amountXRP';
  sortOrder?: 'asc' | 'desc';
}