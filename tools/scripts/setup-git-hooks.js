#!/usr/bin/env node

/**
 * Setup script to install Git hooks for conventional commits validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Setting up Git hooks for conventional commits...');

try {
  // Configure Git to use custom hooks directory
  const hooksPath = path.resolve(__dirname, '../../.githooks');
  execSync(`git config core.hooksPath "${hooksPath}"`, { stdio: 'inherit' });
  
  console.log('✅ Git hooks configured successfully!');
  console.log(`   Hooks directory: ${hooksPath}`);
  console.log('');
  console.log('📝 Commit message validation is now active.');
  console.log('   All commits must follow Conventional Commits standard.');
  console.log('');
  console.log('Examples of valid commit messages:');
  console.log('   feat(packages/asciidoc): add syntax highlighting support');
  console.log('   fix(apps/docs): resolve mobile navigation issue');
  console.log('   docs(templates/astro-minimal): update installation guide');
  console.log('   chore(root): update dependencies');
  console.log('');
  console.log('🔥 For breaking changes, use:');
  console.log('   feat(packages/asciidoc)!: change default export structure');
  console.log('   or include "BREAKING CHANGE:" in commit body');
  
} catch (error) {
  console.error('❌ Failed to setup Git hooks:', error.message);
  process.exit(1);
}
