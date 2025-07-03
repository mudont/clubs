import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { generateVerificationToken, sendVerificationEmail } from './email';

const prisma = new PrismaClient();

export const localStrategy = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
    },
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || !user.passwordHash) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            if (!user.emailVerified) {
                return done(null, false, { message: 'Email not verified.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
);

export async function signup(req: Request, res: Response) {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Email, password, and username are required.' });
    }
    try {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already in use.' });
        }
        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already in use.' });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash: hash,
                emailVerified: false,
            },
        });

        // Send verification email
        const token = generateVerificationToken(email);
        await sendVerificationEmail(email, token);

        return res.status(201).json({ message: 'Signup successful. Please check your email to verify your account.' });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Signup failed.' });
    }
}
