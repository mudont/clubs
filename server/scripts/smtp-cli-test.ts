#!/usr/bin/env ts-node

import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import { hostname } from 'os';

// Load environment variables
config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

type ColorKey = keyof typeof colors;

function log(message: string, color: ColorKey = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}



async function testSMTPConnection(): Promise<boolean> {
  log('🔍 SMTP Connectivity Test', 'bright');
  log('========================', 'bright');

  // Check environment variables
  log('\n📋 Environment Check:', 'cyan');
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailFrom = process.env.EMAIL_FROM;

  if (!emailUser) {
    log('❌ EMAIL_USER not set', 'red');
    return false;
  }
  if (!emailPass) {
    log('❌ EMAIL_PASS not set', 'red');
    return false;
  }

  log(`✅ EMAIL_USER: ${emailUser}`, 'green');
  log(`✅ EMAIL_PASS: ${emailPass ? '***SET***' : 'NOT SET'}`, 'green');
  log(`✅ EMAIL_FROM: ${emailFrom || emailUser}`, 'green');

  // Create transporter
  log('\n📡 Creating SMTP transporter...', 'cyan');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    // Test connection
    log('🔌 Testing SMTP connection...', 'cyan');
    await transporter.verify();
    log('✅ SMTP connection verified successfully!', 'green');

    // Test sending email
    log('\n📧 Testing email sending...', 'cyan');
    const testEmail = {
      from: emailFrom || emailUser,
      to: emailUser, // Send to yourself
      subject: 'SMTP Test - Clubs App',
      html: `
                <h2>SMTP Test Successful!</h2>
                <p>This is a test email from your Clubs app server.</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Server:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <p><strong>Hostname:</strong> ${hostname()}</p>
            `,
    };

    const info = await transporter.sendMail(testEmail);
    log('✅ Test email sent successfully!', 'green');
    log(`📧 Message ID: ${info.messageId}`, 'blue');

    if (info.response) {
      log(`📧 Server Response: ${info.response}`, 'blue');
    }

    log('\n🎉 SMTP test completed successfully!', 'green');
    return true;

  } catch (error) {
    log('\n❌ SMTP test failed!', 'red');
    log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');

    if (error && typeof error === 'object' && 'code' in error) {
      log(`Error Code: ${error.code}`, 'yellow');
    }

    if (error && typeof error === 'object' && 'command' in error) {
      log(`Failed Command: ${error.command}`, 'yellow');
    }

    log('\n🔧 Common Solutions:', 'cyan');
    log('1. Check if EMAIL_USER and EMAIL_PASS are correct', 'yellow');
    log('2. For Gmail: Use App Password (not regular password)', 'yellow');
    log('3. Enable 2FA on Gmail account', 'yellow');
    log('4. Check network connectivity and firewall', 'yellow');
    log('5. Verify Gmail account settings', 'yellow');

    return false;
  }
}

// Run the test
if (require.main === module) {
  testSMTPConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
      process.exit(1);
    });
}

export { testSMTPConnection };
