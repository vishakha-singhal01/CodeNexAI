import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
// import mongoose from 'mongoose'; // No longer needed here
import { Request } from 'express';
import User from '../models/User.js';

export default function configurePassport() {
  // --- Local Strategy (Email/Password) ---
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return done(null, false, { message: `Email ${email} not found.` });
      }
      if (!user.password) {
        // User likely signed up via OAuth and doesn't have a local password
        return done(null, false, { message: 'You previously signed in with a different method. Please use that method to log in.' });
      }
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { message: 'Invalid email or password.' });
    } catch (err) {
      return done(err);
    }
  }));

  // --- Google OAuth 2.0 Strategy ---
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: '/api/auth/google/callback', // Adjust if your API routes are different
    passReqToCallback: true // Allows passing req to the callback
  }, async (req, accessToken, refreshToken, profile: GoogleProfile, done) => {
    try {
      // Check if user already exists via Google ID
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      // Check if user exists via email (potential account linking)
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email: email });
        if (user) {
          // Link Google ID to existing account
          user.googleId = profile.id;
          user.displayName = user.displayName || profile.displayName; // Keep existing name if set
          await user.save();
          return done(null, user);
        }
      }

      // Create new user
      const newUser = new User({
        googleId: profile.id,
        email: email,
        displayName: profile.displayName || profile.name?.givenName || 'User', // Fallback name
      });
      await newUser.save();
      done(null, newUser);
    } catch (err) {
      done(err);
    }
  }));

  // --- GitHub OAuth 2.0 Strategy ---
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: '/api/auth/github/callback', // Adjust if your API routes are different
    scope: ['user:email'], // Request email permission
    passReqToCallback: true
  }, async (req: Request, accessToken: string, refreshToken: string | undefined, profile: GitHubProfile, done: (error: any, user?: any, info?: any) => void) => { // Explicitly typed 'done'
    try {
        // GitHub profile might not always provide email directly in the main profile object
        // It might be in profile.emails array if scope 'user:email' is granted and email is public
        // The 'primary' property might not be in the base type, so we access it carefully or assert type
        const primaryEmailObj = profile.emails?.find(e => (e as any).primary); // Check for primary flag
        const primaryEmail = primaryEmailObj?.value;
        // Access _json cautiously using type assertion
        const emailFromJson = (profile as any)._json?.email;
        const email = primaryEmail || emailFromJson; // Prioritize primary email

        // Check if user already exists via GitHub ID
        let user = await User.findOne({ githubId: profile.id });
        if (user) {
            return done(null, user);
        }

        // Check if user exists via email (potential account linking)
        if (email) {
            user = await User.findOne({ email: email });
            if (user) {
                // Link GitHub ID to existing account
                user.githubId = profile.id;
                user.displayName = user.displayName || profile.displayName || profile.username; // Use existing or GitHub name
                await user.save();
                return done(null, user);
            }
        }

        // Create new user
        const newUser = new User({
            githubId: profile.id,
            email: email, // Might be null if not provided/public
            displayName: profile.displayName || profile.username || 'User', // Fallback name
        });
        await newUser.save();
        done(null, newUser);
    } catch (err) {
        done(err);
    }
}));


  // --- Serialize and Deserialize User ---
  // Determines which data of the user object should be stored in the session.
  passport.serializeUser((user: any, done) => { // Use 'any' or create a specific type/interface if IUser doesn't fit perfectly
    done(null, user.id); // Store only the user ID in the session
  });

  // Retrieves the user data based on the ID stored in the session.
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user); // Pass the full user object to req.user
    } catch (err) {
      done(err);
    }
  });
}
