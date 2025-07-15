#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

// Hide password input
rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("*");
  else
    rl.output.write(stringToWrite);
};

console.log('🔐 Admin Password Generator for LiquidLab\n');
console.log('This tool will generate a secure bcrypt hash for your admin password.');
console.log('The hash will be used as the ADMIN_PASSWORD environment variable.\n');

rl.question('Enter your desired admin password: ', (password) => {
  rl.stdoutMuted = true;
  
  rl.question('\nConfirm your admin password: ', (confirmPassword) => {
    rl.stdoutMuted = false;
    console.log('\n');
    
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match. Please try again.');
      rl.close();
      process.exit(1);
    }
    
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long.');
      rl.close();
      process.exit(1);
    }
    
    // Generate bcrypt hash
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    
    console.log('✅ Password hash generated successfully!\n');
    console.log('Add this to your environment variables:');
    console.log('─'.repeat(60));
    console.log(`ADMIN_PASSWORD=${hash}`);
    console.log('─'.repeat(60));
    console.log('\nIn Replit:');
    console.log('1. Go to the Secrets tab (🔒 icon in the left sidebar)');
    console.log('2. Click "New Secret"');
    console.log('3. Set key as: ADMIN_PASSWORD');
    console.log('4. Set value as the hash above (starting with $2a$...)');
    console.log('5. Click "Add Secret"\n');
    console.log('Your admin login credentials will be:');
    console.log(`Email: ${process.env.ADMIN_EMAIL || 'admin@liquidlab.trade'}`);
    console.log('Password: [the password you just entered]\n');
    
    rl.close();
  });
  
  rl.stdoutMuted = true;
});