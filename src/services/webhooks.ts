import { AxiosInstance } from 'axios';
import { createHmac } from 'crypto';
import { WebhookEvent } from '../types';
import { XRPLSaleError } from '../errors';

/**
 * Service for webhook management and verification
 */
export class WebhooksService {
  constructor(
    private httpClient: AxiosInstance,
    private webhookSecret?: string
  ) {}

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string | Buffer, signature: string, secret?: string): boolean {
    if (!secret && !this.webhookSecret) {
      throw new XRPLSaleError('Webhook secret is required for signature verification');
    }

    const secretToUse = secret || this.webhookSecret!;
    const expectedSignature = createHmac('sha256', secretToUse)
      .update(payload)
      .digest('hex');

    // Compare signatures using constant-time comparison to prevent timing attacks
    return this.safeCompare(`sha256=${expectedSignature}`, signature);
  }

  /**
   * Safe string comparison to prevent timing attacks
   */
  private safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Parse webhook payload
   */
  parseWebhook(payload: string | Buffer): WebhookEvent {
    try {
      const data = typeof payload === 'string' ? payload : payload.toString();
      return JSON.parse(data);
    } catch (error) {
      throw new XRPLSaleError('Invalid webhook payload');
    }
  }

  /**
   * Express.js middleware for webhook handling
   */
  middleware(options?: { 
    secret?: string;
    verifySignature?: boolean;
  }) {
    return (req: any, res: any, next: any) => {
      try {
        // Get raw body
        const rawBody = req.body;
        
        // Verify signature if enabled
        if (options?.verifySignature !== false) {
          const signature = req.headers['x-xrpl-sale-signature'];
          if (!signature) {
            return res.status(401).json({ error: 'Missing signature header' });
          }

          if (!this.verifySignature(rawBody, signature, options?.secret)) {
            return res.status(401).json({ error: 'Invalid signature' });
          }
        }

        // Parse webhook event
        const event = this.parseWebhook(rawBody);
        
        // Add parsed event to request
        req.webhookEvent = event;
        req.body = event;

        next();
      } catch (error) {
        res.status(400).json({ 
          error: error instanceof Error ? error.message : 'Webhook processing failed' 
        });
      }
    };
  }

  /**
   * Register a webhook endpoint
   */
  async register(webhookData: {
    url: string;
    events: string[];
    secret?: string;
    active?: boolean;
  }): Promise<{
    id: string;
    url: string;
    events: string[];
    active: boolean;
    createdAt: string;
  }> {
    const response = await this.httpClient.post('/webhooks', webhookData);
    return response.data;
  }

  /**
   * List registered webhooks
   */
  async list(): Promise<{
    id: string;
    url: string;
    events: string[];
    active: boolean;
    createdAt: string;
    lastDelivery?: string;
  }[]> {
    const response = await this.httpClient.get('/webhooks');
    return response.data;
  }

  /**
   * Update a webhook
   */
  async update(webhookId: string, updates: {
    url?: string;
    events?: string[];
    active?: boolean;
  }): Promise<{
    id: string;
    url: string;
    events: string[];
    active: boolean;
    updatedAt: string;
  }> {
    const response = await this.httpClient.patch(`/webhooks/${webhookId}`, updates);
    return response.data;
  }

  /**
   * Delete a webhook
   */
  async delete(webhookId: string): Promise<{ success: boolean }> {
    const response = await this.httpClient.delete(`/webhooks/${webhookId}`);
    return response.data;
  }

  /**
   * Test webhook delivery
   */
  async test(webhookId: string): Promise<{
    success: boolean;
    responseStatus: number;
    responseTime: number;
    error?: string;
  }> {
    const response = await this.httpClient.post(`/webhooks/${webhookId}/test`);
    return response.data;
  }

  /**
   * Get webhook delivery logs
   */
  async getDeliveries(webhookId: string, options?: {
    page?: number;
    limit?: number;
    status?: 'success' | 'failed';
  }): Promise<{
    deliveries: {
      id: string;
      timestamp: string;
      event: string;
      status: number;
      responseTime: number;
      error?: string;
    }[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);

    const response = await this.httpClient.get(`/webhooks/${webhookId}/deliveries?${params.toString()}`);
    return response.data;
  }
}