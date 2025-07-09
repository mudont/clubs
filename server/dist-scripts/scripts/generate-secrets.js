#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecrets = generateSecrets;
const crypto_1 = require("crypto");
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
function generateSecrets() {
    console.log('🔐 Generating Secure Secrets');
    console.log('============================\n');
    // Generate JWT Secret (at least 32 characters)
    const jwtSecret = (0, crypto_1.randomBytes)(64).toString('hex');
    console.log('JWT_SECRET:');
    console.log(jwtSecret);
    console.log(`Length: ${jwtSecret.length} characters\n`);
    // Generate Session Secret (at least 32 characters)
    const sessionSecret = (0, crypto_1.randomBytes)(64).toString('hex');
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
