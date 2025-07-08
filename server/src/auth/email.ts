import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure email transporter (for development, you can use Gmail or a service like Mailtrap)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use SMTP settings
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export function generateVerificationToken(email: string): string {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:4010'}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email address',
        html: `
      <h1>Welcome to Clubs!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
}

export async function verifyEmailToken(token: string): Promise<string | null> {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { email: string };
        return payload.email;
    } catch (err) {
        return null;
    }
}

export async function markEmailAsVerified(email: string): Promise<void> {
    await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
    });
}

export async function handleEmailVerification(token: string): Promise<{ success: boolean; message: string }> {
    const email = await verifyEmailToken(token);
    if (!email) {
        return { success: false, message: 'Invalid or expired verification token.' };
    }

    try {
        await markEmailAsVerified(email);
        return { success: true, message: 'Email verified successfully! You can now log in.' };
    } catch (err) {
        return { success: false, message: 'Failed to verify email. Please try again.' };
    }
}

export function generatePasswordResetToken(email: string): string {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.BACKEND_URL || 'http://localhost:4010'}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset your password',
        html: `
      <h1>Password Reset Request</h1>
      <p>If you requested a password reset, click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, you can ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
    };

    console.log('[PasswordResetEmail] Attempting to send email:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
    });

    await transporter.sendMail(mailOptions);
} 