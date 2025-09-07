export interface Vulnerability {
  type: string;
  subtype: string;
  risk_factor: number;
  value: string;
  recommendation: string;
  start: number;
  end: number;
}

export interface PromptAnalysisResult {
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

export interface NexusVoidConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface AnalysisOptions {
  timeout?: number;
  retries?: number;
}

export interface NexusVoidError extends Error {
  code?: string;
  status?: number;
  response?: any;
}

export interface HealthCheckResult {
  success: boolean;
  service: string;
  status: string;
  components: {
    python: boolean;
    nexus_guard: boolean;
    dependencies: boolean;
  };
  errors: string[];
  warnings: string[];
  timestamp: string;
}
