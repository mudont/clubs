const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
    console.log('🔍 Testing SMTP connectivity...\n');
    
    // Log configuration (without sensitive data)
    console.log('Configuration:');
    console.log(`- Service: ${process.env.EMAIL_SERVICE || 'gmail'}`);
    console.log(`- User: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`- From: ${process.env.EMAIL_FROM || 'NOT SET'}`);
    console.log(`- Backend URL: ${process.env.BACKEND_URL || 'NOT SET'}\n`);

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        // Test connection
        console.log('📡 Testing connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');

        // Test sending email
        console.log('📧 Testing email sending...');
        const testEmail = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: 'SMTP Test - Clubs App',
            html: `
                <h2>SMTP Test Successful!</h2>
                <p>This is a test email from your Clubs app server.</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Server:</strong> ${process.env.NODE_ENV || 'development'}</p>
            `,
        };

        const info = await transporter.sendMail(testEmail);
        console.log('✅ Test email sent successfully!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`);

    } catch (error) {
        console.error('❌ SMTP test failed:');
        console.error('Error details:', error.message);
        
        if (error.code) {
            console.error(`Error code: ${error.code}`);
        }
        
        if (error.command) {
            console.error(`Failed command: ${error.command}`);
        }
        
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check EMAIL_USER and EMAIL_PASS environment variables');
        console.log('2. Verify Gmail app password is correct (not regular password)');
        console.log('3. Check if 2FA is enabled on Gmail account');
        console.log('4. Verify network connectivity and firewall settings');
        console.log('5. Check Gmail account settings for "Less secure app access"');
        
        process.exit(1);
    }
}

// Run the test
testSMTP().catch(console.error); 