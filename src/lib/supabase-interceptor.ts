/**
 * Supabase Query Interceptor with Retry Logic and Error Handling
 * Provides automatic retry for failed requests and standardized error handling
 */

import { PostgrestError } from '@supabase/supabase-js';
import { ErrorLogger, NetworkError, DatabaseError, ErrorCode } from './errors';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatusCodes: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculates exponential backoff delay
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return delay + jitter;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if error is retryable
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  // Network errors are always retryable
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return true;
  }

  // Check status codes
  if (error.status && config.retryableStatusCodes.includes(error.status)) {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
    return true;
  }

  return false;
}

/**
 * Retry wrapper for async functions
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = await fn();

      // Log successful retry
      if (attempt > 0) {
        console.info(`Request succeeded after ${attempt} retries`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      // Don't retry if not retryable or max retries reached
      if (!isRetryableError(error, retryConfig) || attempt === retryConfig.maxRetries) {
        break;
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt, retryConfig.baseDelay, retryConfig.maxDelay);

      console.warn(
        `Request failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}). ` +
        `Retrying in ${Math.round(delay)}ms...`,
        { error: error.message }
      );

      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Supabase Query Wrapper with retry and error handling
 */
export async function executeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: {
    retry?: Partial<RetryConfig>;
    resource?: string;
    action?: string;
  } = {}
): Promise<T> {
  try {
    const result = await withRetry(queryFn, options.retry);

    if (result.error) {
      throw result.error;
    }

    if (result.data === null) {
      throw new DatabaseError(
        'Nenhum dado retornado',
        ErrorCode.DB_NOT_FOUND,
        {
          resource: options.resource,
          action: options.action,
        }
      );
    }

    return result.data;
  } catch (error: any) {
    // Parse and log error
    const appError = ErrorLogger.logAndParse(error, {
      resource: options.resource,
      action: options.action,
    });

    throw appError;
  }
}

/**
 * Batch query executor with concurrency control
 */
export async function executeBatchQueries<T>(
  queries: Array<() => Promise<T>>,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<T[]> {
  const concurrency = options.concurrency || 5;
  const results: T[] = [];
  const errors: Error[] = [];
  let completed = 0;

  // Split queries into chunks
  const chunks: Array<Array<() => Promise<T>>> = [];
  for (let i = 0; i < queries.length; i += concurrency) {
    chunks.push(queries.slice(i, i + concurrency));
  }

  // Execute chunks sequentially, queries within chunk in parallel
  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map(query => query())
    );

    for (const result of chunkResults) {
      completed++;

      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push(result.reason);
        ErrorLogger.logAndParse(result.reason);
      }

      options.onProgress?.(completed, queries.length);
    }
  }

  // If all queries failed, throw
  if (errors.length === queries.length) {
    throw new DatabaseError(
      `Todas as ${queries.length} consultas falharam`,
      ErrorCode.DB_QUERY_ERROR
    );
  }

  // If some queries failed, log warning
  if (errors.length > 0) {
    console.warn(
      `${errors.length} de ${queries.length} consultas falharam`,
      errors
    );
  }

  return results;
}

/**
 * Query cache for deduplication
 */
class QueryCache {
  private cache = new Map<string, Promise<any>>();
  private ttl = 5000; // 5 seconds

  async get<T>(key: string, queryFn: () => Promise<T>): Promise<T> {
    // Return existing promise if in cache
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Execute query and cache promise
    const promise = queryFn().finally(() => {
      // Remove from cache after TTL
      setTimeout(() => {
        this.cache.delete(key);
      }, this.ttl);
    });

    this.cache.set(key, promise);
    return promise;
  }

  clear() {
    this.cache.clear();
  }
}

export const queryCache = new QueryCache();

/**
 * Online status monitor
 */
export class OnlineStatusMonitor {
  private static instance: OnlineStatusMonitor;
  private isOnline = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];

  private constructor() {
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }

  static getInstance(): OnlineStatusMonitor {
    if (!OnlineStatusMonitor.instance) {
      OnlineStatusMonitor.instance = new OnlineStatusMonitor();
    }
    return OnlineStatusMonitor.instance;
  }

  private setOnline(online: boolean) {
    this.isOnline = online;
    this.listeners.forEach(listener => listener(online));
  }

  getStatus(): boolean {
    return this.isOnline;
  }

  subscribe(listener: (online: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async waitForOnline(timeout = 30000): Promise<void> {
    if (this.isOnline) return;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new NetworkError(
          'Timeout aguardando conexão',
          ErrorCode.NETWORK_TIMEOUT
        ));
      }, timeout);

      const unsubscribe = this.subscribe((online) => {
        if (online) {
          clearTimeout(timer);
          unsubscribe();
          resolve();
        }
      });
    });
  }
}

export const onlineMonitor = OnlineStatusMonitor.getInstance();
