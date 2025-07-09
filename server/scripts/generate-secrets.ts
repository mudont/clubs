#!/usr/bin/env ts-node

import { randomBytes } from 'crypto';
import { config } from 'dotenv';

// Load environment variables
config();

interface GeneratedSecrets {
  jwtSecret: string;
  sessionSecret: string;
  bcryptRounds: number;
  jwtExpiresIn: string;
}

function generateSecrets(): GeneratedSecrets {
  console.log('🔐 Generating Secure Secrets');
  console.log('============================\n');

  // Generate JWT Secret (at least 32 characters)
  const jwtSecret = randomBytes(64).toString('hex');
  console.log('JWT_SECRET:');
  console.log(jwtSecret);
  console.log(`Length: ${jwtSecret.length} characters\n`);

  // Generate Session Secret (at least 32 characters)
  const sessionSecret = randomBytes(64).toString('hex');
  console.log('SESSION_SECRET:');
  console.log(sessionSecret);
  console.log(`Length: ${sessionSecret.length} characters\n`);

  // Generate additional security keys
  const bcryptRounds = 12;
  const jwtExpiresIn = '7d';

  console.log('Additional Security Settings:');
  console.log(`BCRYPT_ROUNDS=${bcryptRounds}`);
  console.log(`JWT_EXPIRES_IN=${jwtExpiresIn}\n`);

  console.log('📋 Copy these to your .env file:');
  console.log('================================');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`SESSION_SECRET=${sessionSecret}`);
  console.log(`BCRYPT_ROUNDS=${bcryptRounds}`);
  console.log(`JWT_EXPIRES_IN=${jwtExpiresIn}\n`);

  console.log('✅ Secrets generated successfully!');
  console.log('💡 Make sure to keep these secrets secure and never commit them to version control.');

  return {
    jwtSecret,
    sessionSecret,
    bcryptRounds,
    jwtExpiresIn
  };
}

// Run the generator
if (require.main === module) {
  generateSecrets();
}

export { GeneratedSecrets, generateSecrets };
