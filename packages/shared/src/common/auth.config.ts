import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { bearer } from "better-auth/plugins";
import connectDB from "./db.config.js";
import WeatherEmail from "../models/weatherEmail.model.js";
import { oAuthProxy } from "better-auth/plugins";

await connectDB();

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.getClient().db()),
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        await WeatherEmail.deleteMany({ user: user.id });
        console.log(`Deleted weather schedules for user: ${user.id}`);
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost/api/auth",
  plugins: [
    bearer(),
    oAuthProxy({
      productionURL: process.env.FRONTEND_URL || "http://localhost",
      currentURL: process.env.FRONTEND_URL || "http://localhost",
    }),
  ],
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost"],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    disableOriginCheck: process.env.NODE_ENV !== "production",
  },
  socialProviders: {
    google: {
      enabled: true,
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    // facebook: {
    //   enabled: true,
    //   clientId: process.env.FACEBOOK_CLIENT_ID as string,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    // },
    // twitter: {
    //   enabled: true,
    //   clientId: process.env.TWITTER_CLIENT_ID as string,
    //   clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    // },
  },
});
