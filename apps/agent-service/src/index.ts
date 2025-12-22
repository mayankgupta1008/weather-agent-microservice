import express from "express";
import connectDB from "@weather-agent/shared/src/common/db.config.js";
import "@weather-agent/shared/src/common/redis.config.js";
import cors from "cors";
import { requireAuth } from "@weather-agent/shared/src/common/auth.middleware.js";
import { toNodeHandler } from "better-auth/node";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"], // Replace with your frontend URL if different
    credentials: true,
  }),
  express.json()
);

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      "Weather agent service connected to DB and is running on PORT:",
      PORT
    );
  });
};

startServer();
