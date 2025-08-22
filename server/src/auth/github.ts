import { PrismaClient } from '@prisma/client';
import { Profile as GitHubProfile, Strategy as GitHubStrategy } from 'passport-github2';
import type { VerifyCallback } from 'passport-oauth2';
import { logError, logInfo } from '../utils/logger';

const prisma = new PrismaClient();

export const githubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4010'}/auth/github/callback`,
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
    done: VerifyCallback
  ) => {
    try {
      logInfo(
        'GitHub OAuth callback received:' +
          JSON.stringify({
            id: profile.id,
            username: profile.username,
            emails: profile.emails?.map(e => e.value),
          })
      );

      const { id, emails, username, photos, displayName } = profile;
      const email = emails?.[0]?.value;

      if (!email) {
        logError('GitHub OAuth: No email provided');
        return done(null, false, { message: 'Email not provided by GitHub.' });
      }

      // Check if user exists with this GitHub account
      const authAccount = await prisma.authAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: 'github',
            providerUserId: id.toString(),
          },
        },
        include: { user: true },
      });

      if (authAccount) {
        logInfo('GitHub OAuth: Found existing user via GitHub account: ' + authAccount.user.id);
        return done(null, authAccount.user);
      }

      // Check if user exists with this email
      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        logInfo('GitHub OAuth: Found existing user via email, linking GitHub account: ' + user.id);
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
      logInfo('GitHub OAuth: Creating new user with email: ' + email);
      user = await prisma.user.create({
        data: {
          email,
          username: username || email.split('@')[0],
          emailVerified: true, // GitHub emails are pre-verified
          photoUrl: photos?.[0]?.value,
          firstName: displayName?.split(' ')[0] || null,
          lastName: displayName?.split(' ').slice(1).join(' ') || null,
          accounts: {
            create: {
              provider: 'github',
              providerUserId: id.toString(),
            },
          },
        },
      });

      logInfo('GitHub OAuth: Successfully created new user: ' + user.id);
      return done(null, user);
    } catch (err) {
      logError('GitHub OAuth error:' + err);
      return done(err);
    }
  }
);
