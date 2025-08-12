const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test the content-file generator with different options
console.log('Testing content-file generator...');

try {
  // Test 1: Basic markdown file
  console.log('\n1. Testing basic markdown file creation...');
  const result = execSync('npx ts-node tools/astro-nx/src/generators/content-file/generator.ts', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  console.log('Test 1 completed');
  
} catch (error) {
  console.error('Error running generator:', error.message);
}
