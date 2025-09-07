const { NexusVoidClient } = require('@nexusvoid/security-sdk');

// Initialize the client
const client = new NexusVoidClient({
  apiKey: process.env.NEXUSVOID_API_KEY || 'nv_e85cdfe26a9e8be37de19c536a58c0b4fb946e944d5f28bb3717efba4e490e14',
  baseUrl: 'http://localhost:8080', // Optional, defaults to production
});

async function analyzePrompt() {
  try {
    console.log('🔍 Analyzing prompt...');
    
    const result = await client.analyzePrompt(
      'My name is John Doe and my email is john.doe@example.com. Please process this data.'
    );
    
    console.log('\n📊 Analysis Results:');
    console.log('==================');
    console.log(`✅ Is Safe: ${result.is_safe ? 'Yes' : 'No'}`);
    console.log(`🔍 Vulnerabilities Found: ${result.vulnerabilities_found}`);
    console.log(`⚠️  Risk Level: ${result.scan_details.risk_level}`);
    console.log(`⏱️  Processing Time: ${result.metadata.processing_time_ms}ms`);
    
    if (result.vulnerabilities_found > 0) {
      console.log('\n🚨 Vulnerabilities Detected:');
      console.log('============================');
      result.vulnerabilities.forEach((vuln, index) => {
        console.log(`\n${index + 1}. ${vuln.type} (${vuln.subtype})`);
        console.log(`   Risk Factor: ${vuln.risk_factor}/10`);
        console.log(`   Value: "${vuln.value}"`);
        console.log(`   Recommendation: ${vuln.recommendation}`);
        console.log(`   Position: ${vuln.start}-${vuln.end}`);
      });
    }
    
    console.log('\n📝 Original Prompt:');
    console.log(result.original_prompt);
    
    console.log('\n🔒 Masked Prompt:');
    console.log(result.masked_prompt);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    
    if (error.code === 'AUTH_ERROR') {
      console.error('🔑 Please check your API key');
    } else if (error.code === 'RATE_LIMIT_ERROR') {
      console.error('⏰ Rate limit exceeded, please try again later');
    } else if (error.code === 'VALIDATION_ERROR') {
      console.error('📝 Invalid input provided');
    }
  }
}

async function checkHealth() {
  try {
    console.log('🏥 Checking service health...');
    const health = await client.healthCheck();
    
    console.log('\n📊 Health Status:');
    console.log('================');
    console.log(`Service: ${health.service}`);
    console.log(`Status: ${health.status}`);
    console.log(`Python: ${health.components.python ? '✅' : '❌'}`);
    console.log(`NexusGuard: ${health.components.nexus_guard ? '✅' : '❌'}`);
    console.log(`Dependencies: ${health.components.dependencies ? '✅' : '❌'}`);
    
    if (health.errors.length > 0) {
      console.log('\n❌ Errors:');
      health.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (health.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      health.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// Run the examples
async function main() {
  console.log('🚀 NexusVoid Security SDK - Basic Usage Example\n');
  
  await checkHealth();
  console.log('\n' + '='.repeat(50) + '\n');
  await analyzePrompt();
}

main().catch(console.error);
