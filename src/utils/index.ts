/**
 * Utility functions for XRPL.Sale SDK
 */

import { Wallet, Client } from 'xrpl';

/**
 * XRPL utility functions
 */
export class XRPLUtils {
  /**
   * Convert drops to XRP
   */
  static dropsToXrp(drops: string | number): string {
    const dropsNum = typeof drops === 'string' ? parseInt(drops, 10) : drops;
    return (dropsNum / 1000000).toString();
  }

  /**
   * Convert XRP to drops
   */
  static xrpToDrops(xrp: string | number): string {
    const xrpNum = typeof xrp === 'string' ? parseFloat(xrp) : xrp;
    return Math.floor(xrpNum * 1000000).toString();
  }

  /**
   * Validate XRPL address
   */
  static isValidAddress(address: string): boolean {
    try {
      // Basic validation - starts with 'r' and is proper length
      return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address);
    } catch {
      return false;
    }
  }

  /**
   * Generate wallet from seed
   */
  static generateWallet(seed?: string): Wallet {
    return seed ? Wallet.fromSeed(seed) : Wallet.generate();
  }

  /**
   * Create XRPL client
   */
  static createClient(server: string = 'wss://xrplcluster.com'): Client {
    return new Client(server);
  }
}

/**
 * Formatting utilities
 */
export class FormatUtils {
  /**
   * Format XRP amount with proper decimals
   */
  static formatXRP(amount: string | number, decimals: number = 6): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(decimals);
  }

  /**
   * Format large numbers with commas
   */
  static formatNumber(num: string | number): string {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    return numValue.toLocaleString();
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Format date to ISO string
   */
  static formatDate(date: Date | string | number): string {
    return new Date(date).toISOString();
  }

  /**
   * Format duration in human readable format
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate positive number
   */
  static isPositiveNumber(value: string | number): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num > 0;
  }

  /**
   * Validate date is in the future
   */
  static isFutureDate(date: Date | string): boolean {
    const dateObj = new Date(date);
    return dateObj > new Date();
  }

  /**
   * Validate project token symbol (uppercase, 3-10 chars, alphanumeric)
   */
  static isValidTokenSymbol(symbol: string): boolean {
    return /^[A-Z][A-Z0-9]{2,9}$/.test(symbol);
  }
}

/**
 * Crypto utilities
 */
export class CryptoUtils {
  /**
   * Generate random string
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Retry utility for API calls
 */
export class RetryUtils {
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    backoff: number = 2
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries) {
          throw lastError;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, i)));
      }
    }
    
    throw lastError!;
  }
}