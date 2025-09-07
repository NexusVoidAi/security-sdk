export class NexusVoidError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly response?: any;

  constructor(
    message: string,
    code?: string,
    status?: number,
    response?: any
  ) {
    super(message);
    this.name = 'NexusVoidError';
    this.code = code;
    this.status = status;
    this.response = response;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NexusVoidError);
    }
  }
}

export class AuthenticationError extends NexusVoidError {
  constructor(message: string = 'Authentication failed', response?: any) {
    super(message, 'AUTH_ERROR', 401, response);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends NexusVoidError {
  constructor(message: string = 'Rate limit exceeded', response?: any) {
    super(message, 'RATE_LIMIT_ERROR', 429, response);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends NexusVoidError {
  constructor(message: string = 'Validation failed', response?: any) {
    super(message, 'VALIDATION_ERROR', 400, response);
    this.name = 'ValidationError';
  }
}

export class ServiceError extends NexusVoidError {
  constructor(message: string = 'Service error', response?: any) {
    super(message, 'SERVICE_ERROR', 500, response);
    this.name = 'ServiceError';
  }
}

export class TimeoutError extends NexusVoidError {
  constructor(message: string = 'Request timeout', response?: any) {
    super(message, 'TIMEOUT_ERROR', 408, response);
    this.name = 'TimeoutError';
  }
}
