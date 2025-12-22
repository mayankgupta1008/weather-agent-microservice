import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import connectDB from "./db.config.js";

await connectDB();

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.getClient().db()),
  baseURL: "http://localhost:5001",
  trustedOrigins: [
    "http://localhost:5001", // Your backend
    "http://localhost:3000", // Add your frontend URL
  ],
  emailAndPassword: {
    enabled: true,
  },
  advanced: { disableOriginCheck: process.env.NODE_ENV !== "production" },
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
