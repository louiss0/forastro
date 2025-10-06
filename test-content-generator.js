const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test the generate-content generator with blog preset
console.log('Testing generate-content generator...');

try {
  console.log('\n1. Generating blog preset content for apps/blog...');
  execSync('pnpm nx g @forastro/nx-astro-plugin:generate-content --project=blog --presets=blog --mdxExamples=true', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('Test completed');
} catch (error) {
  console.error('Error running generator:', error.message);
}
