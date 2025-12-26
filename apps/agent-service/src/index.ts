import express from "express";
import connectDB from "@weather-agent/shared/src/common/db.config.js";
import "@weather-agent/shared/src/common/redis.config.js";
import "./workers/weatherEmail.worker.js"; // Import worker to start listening for jobs
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: [`http://localhost:${process.env.FRONTEND_PORT || 3000}`], // Replace with your frontend URL if different
    credentials: true,
  }),
  express.json()
);

const AGENT_PORT = process.env.AGENT_PORT || 5002;

const startServer = async () => {
  await connectDB();

  app.listen(AGENT_PORT, () => {
    console.log(
      `Weather agent service connected to DB and is running on PORT: ${AGENT_PORT}`
    );
  });
};

startServer();
