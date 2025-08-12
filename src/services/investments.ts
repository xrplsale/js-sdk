import { AxiosInstance } from 'axios';
import { 
  Investment, 
  ListInvestmentsOptions, 
  PaginatedResponse 
} from '../types';

/**
 * Service for managing investments
 */
export class InvestmentsService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * Get an investment by ID
   */
  async get(investmentId: string): Promise<Investment> {
    const response = await this.httpClient.get(`/investments/${investmentId}`);
    return response.data;
  }

  /**
   * List investments with optional filtering
   */
  async list(options: ListInvestmentsOptions = {}): Promise<PaginatedResponse<Investment>> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.projectId) params.append('projectId', options.projectId);
    if (options.investorAccount) params.append('investorAccount', options.investorAccount);
    if (options.status) params.append('status', options.status);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await this.httpClient.get(`/investments?${params.toString()}`);
    return response.data;
  }

  /**
   * Get investments for a specific project
   */
  async getByProject(projectId: string, options: Omit<ListInvestmentsOptions, 'projectId'> = {}): Promise<PaginatedResponse<Investment>> {
    return this.list({ ...options, projectId });
  }

  /**
   * Get investments for a specific investor
   */
  async getByInvestor(investorAccount: string, options: Omit<ListInvestmentsOptions, 'investorAccount'> = {}): Promise<PaginatedResponse<Investment>> {
    return this.list({ ...options, investorAccount });
  }

  /**
   * Create a new investment
   */
  async create(investmentData: {
    projectId: string;
    amountXRP: string;
    tier?: number;
    investorAccount: string;
  }): Promise<Investment> {
    const response = await this.httpClient.post('/investments', investmentData);
    return response.data;
  }

  /**
   * Get investment summary for an investor
   */
  async getInvestorSummary(investorAccount: string): Promise<{
    totalInvestments: number;
    totalAmountXRP: string;
    activeInvestments: number;
    completedInvestments: number;
    projects: string[];
  }> {
    const response = await this.httpClient.get(`/investments/summary/${investorAccount}`);
    return response.data;
  }

  /**
   * Simulate an investment (check pricing, fees, etc.)
   */
  async simulate(simulationData: {
    projectId: string;
    amountXRP: string;
    tier?: number;
  }): Promise<{
    amountXRP: string;
    tokenAmount: string;
    pricePerToken: string;
    tier: number;
    fees: {
      platformFee: string;
      networkFee: string;
      totalFees: string;
    };
    minimumInvestment: string;
    maximumInvestment: string;
  }> {
    const response = await this.httpClient.post('/investments/simulate', simulationData);
    return response.data;
  }

  /**
   * Get confirmed investments only
   */
  async getConfirmed(options: Omit<ListInvestmentsOptions, 'status'> = {}): Promise<PaginatedResponse<Investment>> {
    return this.list({ ...options, status: 'confirmed' });
  }

  /**
   * Get pending investments only
   */
  async getPending(options: Omit<ListInvestmentsOptions, 'status'> = {}): Promise<PaginatedResponse<Investment>> {
    return this.list({ ...options, status: 'pending' });
  }
}