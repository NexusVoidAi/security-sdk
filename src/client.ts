import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  NexusVoidConfig,
  PromptAnalysisResult,
  HealthCheckResult,
  AnalysisOptions,
} from './types';
import {
  NexusVoidError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ServiceError,
  TimeoutError,
} from './errors';

export class NexusVoidClient {
  private client: AxiosInstance;
  private config: Required<NexusVoidConfig>;

  constructor(config: NexusVoidConfig) {
    this.config = {
      baseUrl: 'https://api.nexusvoid.com',
      timeout: 30000,
      retries: 3,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': '@nexusvoid/security-sdk/1.0.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.debug(`[NexusVoid SDK] Making request to ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[NexusVoid SDK] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.debug(`[NexusVoid SDK] Response received: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        const nexusError = this.handleError(error);
        console.error('[NexusVoid SDK] Response error:', nexusError);
        return Promise.reject(nexusError);
      }
    );
  }

  private handleError(error: any): NexusVoidError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.error || data?.message || error.message || 'Unknown error';

      switch (status) {
        case 401:
          return new AuthenticationError(message, data);
        case 429:
          return new RateLimitError(message, data);
        case 400:
          return new ValidationError(message, data);
        case 408:
          return new TimeoutError(message, data);
        case 500:
        case 502:
        case 503:
        case 504:
          return new ServiceError(message, data);
        default:
          return new NexusVoidError(message, 'HTTP_ERROR', status, data);
      }
    } else if (error.code === 'ECONNABORTED') {
      return new TimeoutError('Request timeout', error.response);
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new ServiceError('Unable to connect to NexusVoid API', error.response);
    } else {
      return new NexusVoidError(error.message || 'Unknown error', 'UNKNOWN_ERROR', undefined, error.response);
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = this.config.retries
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        console.debug(`[NexusVoid SDK] Retrying request, ${retries} attempts left`);
        await this.delay(1000 * (this.config.retries - retries + 1)); // Exponential backoff
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof RateLimitError) {
      return true;
    }
    if (error instanceof TimeoutError) {
      return true;
    }
    if (error instanceof ServiceError && error.status && error.status >= 500) {
      return true;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Analyze a prompt for security vulnerabilities and PII
   * @param prompt - The prompt text to analyze
   * @param options - Optional analysis configuration
   * @returns Promise<PromptAnalysisResult>
   */
  async analyzePrompt(
    prompt: string,
    options: AnalysisOptions = {}
  ): Promise<PromptAnalysisResult> {
    if (!prompt || typeof prompt !== 'string') {
      throw new ValidationError('Prompt must be a non-empty string');
    }

    if (prompt.length > 10000) {
      throw new ValidationError('Prompt must be less than 10,000 characters');
    }

    const requestConfig: AxiosRequestConfig = {
      timeout: options.timeout || this.config.timeout,
    };

    try {
      const response = await this.retryRequest(
        () => this.client.post('/v1/prompt-analysis/analyze', { prompt }, requestConfig),
        options.retries
      );

      return response.data;
    } catch (error) {
      if (error instanceof NexusVoidError) {
        throw error;
      }
      throw new ServiceError('Failed to analyze prompt', (error as any).response);
    }
  }

  /**
   * Check the health status of the NexusVoid service
   * @returns Promise<HealthCheckResult>
   */
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const response = await this.client.get('/v1/prompt-analysis/health');
      return response.data;
    } catch (error) {
      if (error instanceof NexusVoidError) {
        throw error;
      }
      throw new ServiceError('Failed to check service health', (error as any).response);
    }
  }

  /**
   * Get the current configuration
   * @returns NexusVoidConfig
   */
  getConfig(): NexusVoidConfig {
    return { ...this.config };
  }

  /**
   * Update the API key
   * @param apiKey - New API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  }

  /**
   * Update the base URL
   * @param baseUrl - New base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
    this.client.defaults.baseURL = baseUrl;
  }
}
