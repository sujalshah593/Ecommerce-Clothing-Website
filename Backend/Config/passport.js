import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });

import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../Models/User.js"; 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          // Case A: New Google email -> create account normally
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            password: crypto.randomBytes(32).toString("hex"),
            isVerified: true,
          });
          return done(null, user);
        }

        // User exists
        if (user.googleId === profile.id) {
          // Case D: Existing Google account -> authenticate normally
          return done(null, user);
        }

        // googleId is either missing or doesn't match
        if (user.isVerified) {
          // Case B: Existing local account with same email AND verified
          return done(null, false, { message: "An account with this email already exists. Please log in using your password." });
        } else {
          // Case C: Existing local account with same email AND NOT verified
          return done(null, false, { message: "An unverified account with this email exists. Please verify it or use a different account." });
        }
      } catch (error) {
        done(error, null);
      }
    }
  )
);

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).select("-password");

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
