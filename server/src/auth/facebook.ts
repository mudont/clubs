import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const facebookStrategy = new FacebookStrategy(
    {
        clientID: process.env.FACEBOOK_CLIENT_ID || '',
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4010'}/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'photos'],
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const { id, emails, displayName, photos } = profile;
            const email = emails?.[0]?.value;

            if (!email) {
                return done(null, false, { message: 'Email not provided by Facebook.' });
            }

            // Check if user exists with this Facebook account
            let authAccount = await prisma.authAccount.findUnique({
                where: { provider_providerUserId: { provider: 'facebook', providerUserId: id } },
                include: { user: true },
            });

            if (authAccount) {
                return done(null, authAccount.user);
            }

            // Check if user exists with this email
            let user = await prisma.user.findUnique({ where: { email } });

            if (user) {
                // Link existing user to Facebook account
                await prisma.authAccount.create({
                    data: {
                        provider: 'facebook',
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
                    emailVerified: true, // Facebook emails are pre-verified
                    photoUrl: photos?.[0]?.value,
                    accounts: {
                        create: {
                            provider: 'facebook',
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