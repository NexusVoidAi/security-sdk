import { NexusVoidClient } from './client';

export { NexusVoidClient } from './client';
export {
  NexusVoidError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ServiceError,
  TimeoutError,
} from './errors';
export {
  NexusVoidConfig,
  PromptAnalysisResult,
  HealthCheckResult,
  AnalysisOptions,
  Vulnerability,
  NexusVoidError as NexusVoidErrorType,
} from './types';

// Default export
export { NexusVoidClient as default } from './client';

// Convenience function for quick setup
export function createClient(config: { apiKey: string; baseUrl?: string; timeout?: number; retries?: number }) {
  return new NexusVoidClient(config);
}
