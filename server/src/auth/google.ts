import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4010'}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const { id, emails, displayName, photos } = profile;
            const email = emails?.[0]?.value;

            if (!email) {
                return done(null, false, { message: 'Email not provided by Google.' });
            }

            // Check if user exists with this Google account
            let authAccount = await prisma.authAccount.findUnique({
                where: { provider_providerUserId: { provider: 'google', providerUserId: id } },
                include: { user: true },
            });

            if (authAccount) {
                return done(null, authAccount.user);
            }

            // Check if user exists with this email
            let user = await prisma.user.findUnique({ where: { email } });

            if (user) {
                // Link existing user to Google account
                await prisma.authAccount.create({
                    data: {
                        provider: 'google',
                        providerUserId: id,
                        userId: user.id,
                    },
                });
                return done(null, user);
            }

            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    username: displayName || email.split('@')[0],
                    emailVerified: true, // Google emails are pre-verified
                    photoUrl: photos?.[0]?.value,
                    accounts: {
                        create: {
                            provider: 'google',
                            providerUserId: id,
                        },
                    },
                },
            });

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
);
