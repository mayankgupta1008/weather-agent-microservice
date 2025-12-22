import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import connectDB from "@weather-agent/shared/src/common/db.config.js";
import { auth } from "@weather-agent/shared/src/common/auth.config.js";
import { requireAuth } from "@weather-agent/shared/src/common/auth.middleware.js";

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
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

/**
 * 3. Sample Protected Route
 * This is how you protect your logic routes using the shared middleware.
 */
app.get("/api/test-auth", requireAuth, (req, res) => {
  const user = res.locals.user;
  res.json({
    message: `Success! Authenticated as ${user.name}`,
    user,
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend service running on http://localhost:${PORT}`);
      console.log(
        `Auth endpoints available at http://localhost:${PORT}/api/auth/:path`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
