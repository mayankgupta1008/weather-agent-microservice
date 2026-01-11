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
  baseURL: "http://localhost/api/auth",
  plugins: [
    bearer(),
    oAuthProxy({
      productionURL:
        process.env.NODE_ENV === "production"
          ? "http://localhost"
          : "http://localhost:5173",
      currentURL:
        process.env.NODE_ENV === "production"
          ? "http://localhost"
          : "http://localhost:5173",
    }),
  ],
  trustedOrigins: [
    process.env.NODE_ENV === "production"
      ? "http://localhost"
      : "http://localhost:5173",
  ],
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
