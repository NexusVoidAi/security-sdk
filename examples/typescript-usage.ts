import { NexusVoidClient, createClient } from '@nexusvoid/security-sdk';

// Method 1: Using the class directly
const client = new NexusVoidClient({
  apiKey: process.env.NEXUSVOID_API_KEY || 'your-api-key-here',
  baseUrl: 'https://api.nexusvoid.com',
  timeout: 30000,
  retries: 3,
});

// Method 2: Using the convenience function
const quickClient = createClient({
  apiKey: process.env.NEXUSVOID_API_KEY || 'your-api-key-here',
});

interface AnalysisResult {
  isSafe: boolean;
  riskLevel: string;
  vulnerabilities: Array<{
    type: string;
    riskFactor: number;
    value: string;
    recommendation: string;
  }>;
  maskedPrompt: string;
}

async function analyzePromptSafely(prompt: string): Promise<AnalysisResult | null> {
  try {
    const result = await client.analyzePrompt(prompt, {
      timeout: 15000,
      retries: 2,
    });

    return {
      isSafe: result.is_safe,
      riskLevel: result.scan_details.risk_level,
      vulnerabilities: result.vulnerabilities.map(vuln => ({
        type: vuln.type,
        riskFactor: vuln.risk_factor,
        value: vuln.value,
        recommendation: vuln.recommendation,
      })),
      maskedPrompt: result.masked_prompt,
    };
  } catch (error) {
    console.error('Analysis failed:', error);
    return null;
  }
}

async function batchAnalyzePrompts(prompts: string[]): Promise<AnalysisResult[]> {
  const results = await Promise.allSettled(
    prompts.map(prompt => analyzePromptSafely(prompt))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<AnalysisResult> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
}

async function main() {
  console.log('🔍 NexusVoid Security SDK - TypeScript Example\n');

  // Check service health first
  try {
    const health = await client.healthCheck();
    console.log(`🏥 Service Status: ${health.status}`);
    
    if (health.status !== 'healthy') {
      console.log('⚠️  Service is not healthy, proceeding with caution...');
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return;
  }

  // Analyze a single prompt
  const testPrompt = 'My name is John Doe, email: john@example.com, phone: +1-555-123-4567';
  console.log(`\n📝 Analyzing: "${testPrompt}"`);
  
  const result = await analyzePromptSafely(testPrompt);
  if (result) {
    console.log(`✅ Is Safe: ${result.isSafe}`);
    console.log(`⚠️  Risk Level: ${result.riskLevel}`);
    console.log(`🔒 Masked: ${result.maskedPrompt}`);
    
    if (result.vulnerabilities.length > 0) {
      console.log('\n🚨 Vulnerabilities:');
      result.vulnerabilities.forEach((vuln, index) => {
        console.log(`  ${index + 1}. ${vuln.type} (Risk: ${vuln.riskFactor}/10)`);
        console.log(`     Value: "${vuln.value}"`);
        console.log(`     Recommendation: ${vuln.recommendation}`);
      });
    }
  }

  // Batch analysis
  const prompts = [
    'Hello world',
    'My email is user@example.com',
    'Please send money to account 123456789',
    'What is the weather like today?',
  ];

  console.log('\n📊 Batch Analysis:');
  console.log('==================');
  
  const batchResults = await batchAnalyzePrompts(prompts);
  
  batchResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.isSafe ? '✅ Safe' : '❌ Unsafe'} (${result.riskLevel})`);
    if (!result.isSafe) {
      console.log(`   Vulnerabilities: ${result.vulnerabilities.length}`);
    }
  });

  // Configuration management
  console.log('\n⚙️  Current Configuration:');
  const config = client.getConfig();
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Timeout: ${config.timeout}ms`);
  console.log(`Retries: ${config.retries}`);
}

main().catch(console.error);
