# NexusVoid Security SDK

A TypeScript/JavaScript SDK for the NexusVoid Security API, providing prompt analysis and vulnerability scanning capabilities.

## Features

- 🔍 **Prompt Analysis**: Analyze prompts for security vulnerabilities and PII
- 🛡️ **Vulnerability Detection**: Detect various types of security issues
- 🚀 **Easy Integration**: Simple API with TypeScript support
- 🔄 **Automatic Retries**: Built-in retry logic with exponential backoff
- 📊 **Health Monitoring**: Service health check capabilities
- 🎯 **Error Handling**: Comprehensive error handling with specific error types

## Installation

```bash
npm install @nexusvoid/security-sdk
```

## Quick Start

```typescript
import { NexusVoidClient } from '@nexusvoid/security-sdk';

// Initialize the client
const client = new NexusVoidClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.nexusvoid.com', // Optional, defaults to production
});

// Analyze a prompt
try {
  const result = await client.analyzePrompt('Your prompt text here');
  
  console.log('Is safe:', result.is_safe);
  console.log('Vulnerabilities found:', result.vulnerabilities_found);
  console.log('Masked prompt:', result.masked_prompt);
  
  // Process vulnerabilities
  result.vulnerabilities.forEach(vuln => {
    console.log(`${vuln.type}: ${vuln.value} (Risk: ${vuln.risk_factor}/10)`);
    console.log(`Recommendation: ${vuln.recommendation}`);
  });
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

## API Reference

### NexusVoidClient

#### Constructor

```typescript
new NexusVoidClient(config: NexusVoidConfig)
```

**Config Options:**
- `apiKey` (string, required): Your NexusVoid API key
- `baseUrl` (string, optional): API base URL (default: 'https://api.nexusvoid.com')
- `timeout` (number, optional): Request timeout in milliseconds (default: 30000)
- `retries` (number, optional): Number of retry attempts (default: 3)

#### Methods

##### analyzePrompt(prompt, options?)

Analyzes a prompt for security vulnerabilities and PII.

```typescript
const result = await client.analyzePrompt('Your prompt text', {
  timeout: 15000,
  retries: 2
});
```

**Parameters:**
- `prompt` (string): The prompt text to analyze
- `options` (AnalysisOptions, optional):
  - `timeout` (number): Request timeout in milliseconds
  - `retries` (number): Number of retry attempts

**Returns:** `Promise<PromptAnalysisResult>`

##### healthCheck()

Checks the health status of the NexusVoid service.

```typescript
const health = await client.healthCheck();
console.log('Service status:', health.status);
```

**Returns:** `Promise<HealthCheckResult>`

##### getConfig()

Returns the current client configuration.

```typescript
const config = client.getConfig();
console.log('API Key:', config.apiKey);
```

**Returns:** `NexusVoidConfig`

##### setApiKey(apiKey)

Updates the API key.

```typescript
client.setApiKey('new-api-key');
```

##### setBaseUrl(baseUrl)

Updates the base URL.

```typescript
client.setBaseUrl('https://staging-api.nexusvoid.com');
```

## Data Types

### PromptAnalysisResult

```typescript
interface PromptAnalysisResult {
  success: boolean;
  timestamp: string;
  original_prompt: string;
  is_safe: boolean;
  masked_prompt: string;
  vulnerabilities_found: number;
  vulnerabilities: Vulnerability[];
  scan_details: {
    total_findings: number;
    risk_level: string;
  };
  metadata: {
    processing_time_ms: number;
    python_version: string;
    nexus_guard_version: string;
  };
}
```

### Vulnerability

```typescript
interface Vulnerability {
  type: string;
  subtype: string;
  risk_factor: number;
  value: string;
  recommendation: string;
  start: number;
  end: number;
}
```

## Error Handling

The SDK provides specific error types for different scenarios:

```typescript
import { 
  NexusVoidError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ServiceError,
  TimeoutError
} from '@nexusvoid/security-sdk';

try {
  const result = await client.analyzePrompt('test');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof ServiceError) {
    console.error('Service error:', error.message);
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Examples

### Basic Usage

```typescript
import { NexusVoidClient } from '@nexusvoid/security-sdk';

const client = new NexusVoidClient({
  apiKey: process.env.NEXUSVOID_API_KEY!
});

// Analyze a prompt
const result = await client.analyzePrompt('My name is John Doe and my email is john@example.com');

if (!result.is_safe) {
  console.log('⚠️  Prompt contains sensitive information');
  console.log('Masked version:', result.masked_prompt);
  
  result.vulnerabilities.forEach(vuln => {
    console.log(`- ${vuln.type}: ${vuln.value}`);
  });
} else {
  console.log('✅ Prompt is safe to use');
}
```

### With Custom Configuration

```typescript
import { NexusVoidClient } from '@nexusvoid/security-sdk';

const client = new NexusVoidClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://staging-api.nexusvoid.com',
  timeout: 60000,
  retries: 5
});

// Check service health before analysis
const health = await client.healthCheck();
if (health.status !== 'healthy') {
  throw new Error('Service is not healthy');
}

// Analyze with custom options
const result = await client.analyzePrompt('Your prompt', {
  timeout: 30000,
  retries: 2
});
```

### Batch Processing

```typescript
import { NexusVoidClient } from '@nexusvoid/security-sdk';

const client = new NexusVoidClient({
  apiKey: process.env.NEXUSVOID_API_KEY!
});

const prompts = [
  'Hello world',
  'My email is user@example.com',
  'Please send money to account 123456789'
];

const results = await Promise.allSettled(
  prompts.map(prompt => client.analyzePrompt(prompt))
);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`Prompt ${index + 1}: ${result.value.is_safe ? 'Safe' : 'Unsafe'}`);
  } else {
    console.error(`Prompt ${index + 1} failed:`, result.reason.message);
  }
});
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT

## Support

For support and questions, please visit our [GitHub repository](https://github.com/nexusvoid/security-sdk) or contact us at support@nexusvoid.com.
