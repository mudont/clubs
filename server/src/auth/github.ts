import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const githubStrategy = new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4010'}/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const { id, emails, username, photos } = profile;
            const email = emails?.[0]?.value;

            if (!email) {
                return done(null, false, { message: 'Email not provided by GitHub.' });
            }

            // Check if user exists with this GitHub account
            let authAccount = await prisma.authAccount.findUnique({
                where: { provider_providerUserId: { provider: 'github', providerUserId: id.toString() } },
                include: { user: true },
            });

            if (authAccount) {
                return done(null, authAccount.user);
            }

            // Check if user exists with this email
            let user = await prisma.user.findUnique({ where: { email } });

            if (user) {
                // Link existing user to GitHub account
                await prisma.authAccount.create({
                    data: {
                        provider: 'github',
                        providerUserId: id.toString(),
                        userId: user.id,
                    },
                });
                return done(null, user);
            }

            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    username: username || email.split('@')[0],
                    emailVerified: true, // GitHub emails are pre-verified
                    photoUrl: photos?.[0]?.value,
                    accounts: {
                        create: {
                            provider: 'github',
                            providerUserId: id.toString(),
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
