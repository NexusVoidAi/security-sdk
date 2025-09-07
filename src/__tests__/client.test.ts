import { NexusVoidClient } from '../client';
import { AuthenticationError, ValidationError } from '../errors';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('NexusVoidClient', () => {
  let client: NexusVoidClient;

  beforeEach(() => {
    client = new NexusVoidClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://test-api.nexusvoid.com',
    });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const defaultClient = new NexusVoidClient({
        apiKey: 'test-key',
      });
      
      const config = defaultClient.getConfig();
      expect(config.baseUrl).toBe('https://api.nexusvoid.com');
      expect(config.timeout).toBe(30000);
      expect(config.retries).toBe(3);
    });

    it('should initialize with custom config', () => {
      const config = client.getConfig();
      expect(config.apiKey).toBe('test-api-key');
      expect(config.baseUrl).toBe('https://test-api.nexusvoid.com');
    });
  });

  describe('analyzePrompt', () => {
    it('should successfully analyze a prompt', async () => {
      const mockResponse = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          original_prompt: 'test prompt',
          is_safe: true,
          masked_prompt: 'test prompt',
          vulnerabilities_found: 0,
          vulnerabilities: [],
          scan_details: {
            total_findings: 0,
            risk_level: 'LOW',
          },
          metadata: {
            processing_time_ms: 100,
            python_version: '3.x',
            nexus_guard_version: '1.0.0',
          },
        },
      };

      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await client.analyzePrompt('test prompt');
      
      expect(result.success).toBe(true);
      expect(result.is_safe).toBe(true);
      expect(result.vulnerabilities_found).toBe(0);
    });

    it('should throw ValidationError for empty prompt', async () => {
      await expect(client.analyzePrompt('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for non-string prompt', async () => {
      await expect(client.analyzePrompt(null as any)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for prompt too long', async () => {
      const longPrompt = 'a'.repeat(10001);
      await expect(client.analyzePrompt(longPrompt)).rejects.toThrow(ValidationError);
    });

    it('should handle authentication error', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { error: 'Invalid API key' },
        },
      };

      axios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      await expect(client.analyzePrompt('test')).rejects.toThrow(AuthenticationError);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const mockResponse = {
        data: {
          success: true,
          service: 'prompt-analysis',
          status: 'healthy',
          components: {
            python: true,
            nexus_guard: true,
            dependencies: true,
          },
          errors: [],
          warnings: [],
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await client.healthCheck();
      
      expect(result.success).toBe(true);
      expect(result.status).toBe('healthy');
    });
  });

  describe('configuration methods', () => {
    it('should update API key', () => {
      client.setApiKey('new-api-key');
      const config = client.getConfig();
      expect(config.apiKey).toBe('new-api-key');
    });

    it('should update base URL', () => {
      client.setBaseUrl('https://new-api.nexusvoid.com');
      const config = client.getConfig();
      expect(config.baseUrl).toBe('https://new-api.nexusvoid.com');
    });
  });
});
