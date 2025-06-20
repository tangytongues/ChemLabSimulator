#!/usr/bin/env node

/**
 * ChemLab Virtual - Setup Verification Script
 * Verifies that the downloaded package is ready to run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 ChemLab Virtual - Setup Verification\n');

const checks = [
  {
    name: 'Package.json exists',
    check: () => fs.existsSync('package.json'),
    fix: 'Ensure you downloaded the complete package'
  },
  {
    name: 'Data directory exists',
    check: () => fs.existsSync('data') && fs.existsSync('data/experiments.json'),
    fix: 'Extract all files from the ZIP package'
  },
  {
    name: 'Client files exist',
    check: () => fs.existsSync('client') && fs.existsSync('client/src'),
    fix: 'Complete package extraction required'
  },
  {
    name: 'Server files exist',
    check: () => fs.existsSync('server') && fs.existsSync('server/index.ts'),
    fix: 'Complete package extraction required'
  },
  {
    name: 'Launcher scripts exist',
    check: () => fs.existsSync('start-windows.bat') && fs.existsSync('start-mac.command') && fs.existsSync('start-linux.sh'),
    fix: 'Download the complete package with launcher scripts'
  },
  {
    name: 'Node.js version check',
    check: () => {
      try {
        const version = process.version;
        const major = parseInt(version.slice(1).split('.')[0]);
        return major >= 18;
      } catch {
        return false;
      }
    },
    fix: 'Install Node.js 18+ from https://nodejs.org'
  },
  {
    name: 'Experiment data validation',
    check: () => {
      try {
        const experimentsData = JSON.parse(fs.readFileSync('data/experiments.json', 'utf8'));
        return Array.isArray(experimentsData) && experimentsData.length >= 2;
      } catch {
        return false;
      }
    },
    fix: 'Ensure experiments.json is not corrupted'
  }
];

let allPassed = true;

console.log('Running system checks...\n');

checks.forEach((check, index) => {
  process.stdout.write(`${index + 1}. ${check.name}... `);
  
  try {
    if (check.check()) {
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
      console.log(`   Fix: ${check.fix}\n`);
      allPassed = false;
    }
  } catch (error) {
    console.log('❌ ERROR');
    console.log(`   Error: ${error.message}`);
    console.log(`   Fix: ${check.fix}\n`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! ChemLab Virtual is ready to run.');
  console.log('\nNext steps:');
  console.log('• Run the launcher script for your operating system');
  console.log('• Windows: start-windows.bat');
  console.log('• Mac: start-mac.command');
  console.log('• Linux: start-linux.sh');
  console.log('\nOr manually run: npm install && npm run dev');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above before running.');
  console.log('\nFor help, see:');
  console.log('• README.md - Complete documentation');
  console.log('• QUICK_START.md - Simple setup guide');
  console.log('• SETUP.md - Detailed installation steps');
}

console.log('\n🧪 ChemLab Virtual Setup Verification Complete');