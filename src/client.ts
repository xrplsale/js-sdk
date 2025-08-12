import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProjectsService } from './services/projects';
import { InvestmentsService } from './services/investments';
import { AnalyticsService } from './services/analytics';
import { WebhooksService } from './services/webhooks';
import { AuthService } from './services/auth';
import { XRPLSaleConfig, Environment } from './types';
import { XRPLSaleError } from './errors';

/**
 * Main XRPL.Sale SDK client
 */
export class XRPLSaleClient {
  private httpClient: AxiosInstance;
  public readonly projects: ProjectsService;
  public readonly investments: InvestmentsService;
  public readonly analytics: AnalyticsService;
  public readonly webhooks: WebhooksService;
  public readonly auth: AuthService;

  constructor(config: XRPLSaleConfig) {
    // Validate configuration
    if (!config.apiKey) {
      throw new XRPLSaleError('API key is required');
    }

    // Set base URL based on environment
    const baseURL = this.getBaseURL(config.environment || 'production');

    // Create HTTP client
    this.httpClient = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': `xrpl-sale-js-sdk/1.0.0`,
      },
      timeout: config.timeout || 30000,
    });

    // Add request interceptor for logging if debug mode
    if (config.debug) {
      this.httpClient.interceptors.request.use((request) => {
        console.log(`[XRPL.Sale SDK] ${request.method?.toUpperCase()} ${request.url}`);
        return request;
      });
    }

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new XRPLSaleError(
            error.response.data?.message || 'API request failed',
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          throw new XRPLSaleError('Network error - no response received');
        } else {
          throw new XRPLSaleError(`Request setup error: ${error.message}`);
        }
      }
    );

    // Initialize services
    this.projects = new ProjectsService(this.httpClient);
    this.investments = new InvestmentsService(this.httpClient);
    this.analytics = new AnalyticsService(this.httpClient);
    this.webhooks = new WebhooksService(this.httpClient, config.webhookSecret);
    this.auth = new AuthService(this.httpClient);
  }

  private getBaseURL(environment: Environment): string {
    switch (environment) {
      case 'production':
        return 'https://xrpl.sale/api';
      case 'testnet':
        return 'https://testnet.xrpl.sale/api';
      default:
        throw new XRPLSaleError(`Unknown environment: ${environment}`);
    }
  }

  /**
   * Test the API connection
   */
  async ping(): Promise<{ success: boolean; timestamp: string }> {
    const response = await this.httpClient.get('/ping');
    return response.data;
  }

  /**
   * Get API status and health information
   */
  async getStatus(): Promise<{
    status: string;
    version: string;
    uptime: number;
    environment: string;
  }> {
    const response = await this.httpClient.get('/status');
    return response.data;
  }
}