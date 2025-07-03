import passport from 'passport';
import { localStrategy } from './local';
import { googleStrategy } from './google';
import { githubStrategy } from './github';
import { facebookStrategy } from './facebook';
import { User } from '@prisma/client';

passport.use('local', localStrategy);
passport.use('google', googleStrategy);
passport.use('github', githubStrategy);
passport.use('facebook', facebookStrategy);

// For JWT-based auth, serialization is minimal, but we provide stubs for completeness
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
    // In a stateless JWT setup, this is not used, but required by Passport
    done(null, { id });
});

export default passport;
