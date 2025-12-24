import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import connectDB from "@weather-agent/shared/src/common/db.config.js";
import { auth } from "@weather-agent/shared/src/common/auth.config.js";
import { requireAuth } from "@weather-agent/shared/src/common/auth.middleware.js";
import weatherScheduleRouter from "./routes/weatherSchedule.route.js";

dotenv.config();

const app = express();

/**
 * 1. Configure CORS
 * BetterAuth relies on cookies/headers, so we MUST enable credentials
 * and specify the exact origin of your frontend.
 */
app.use(
  cors({
    origin: ["http://localhost:3000"], // Replace with your frontend URL if different
    credentials: true,
  })
);

/**
 * 2. Mount BetterAuth Handler
 * This single line handles ALL auth logic:
 * - POST /api/auth/signup/email
 * - POST /api/auth/sign-in/email
 * - GET  /api/auth/get-session
 * - etc.
 */

// Better-auth suggests to put this before express.json()
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

app.use("/api/schedule", weatherScheduleRouter);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
