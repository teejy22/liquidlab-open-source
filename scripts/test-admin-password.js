#!/usr/bin/env node

import bcrypt from 'bcryptjs';

console.log('🔍 Admin Password Tester\n');

// Check if ADMIN_PASSWORD is set
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD environment variable is NOT set!');
  console.log('\nPlease add ADMIN_PASSWORD to your Secrets tab.');
  process.exit(1);
}

console.log('✅ ADMIN_PASSWORD is set');
// Removed sensitive logging that exposed hash details

// Check if it's a valid bcrypt hash
if (!ADMIN_PASSWORD.startsWith('$2a$') && !ADMIN_PASSWORD.startsWith('$2b$')) {
  console.error('\n❌ ADMIN_PASSWORD doesn\'t look like a valid bcrypt hash!');
  console.log('A bcrypt hash should start with $2a$ or $2b$');
  console.log('\nMake sure you set the hash value (not your actual password) in Secrets.');
  process.exit(1);
}

console.log('✅ Hash format looks valid\n');

// Test password
const testPasswords = [
  'admin123',
  'Admin123',
  'password',
  'Password123',
  'admin',
  'liquidlab2025'
];

console.log('Testing common passwords...\n');

for (const password of testPasswords) {
  const matches = bcrypt.compareSync(password, ADMIN_PASSWORD);
  if (matches) {
    console.log(`✅ Found match! Password verified.`);
    console.log('\nLogin with:');
    console.log('Email: admin@liquidlab.trade');
    console.log('Password: [REDACTED - check your configuration]');
    process.exit(0);
  }
}

console.log('❌ None of the common passwords matched.\n');
console.log('To test your specific password, run:');
console.log('node -e "import(\'bcryptjs\').then(b => console.log(b.compareSync(\'YOUR_PASSWORD\', process.env.ADMIN_PASSWORD) ? \'✅ Password matches!\' : \'❌ Password does NOT match\'))"');
console.log('\nReplace YOUR_PASSWORD with the password you think you set.');