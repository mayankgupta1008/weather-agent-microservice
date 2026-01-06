import dotenv from "dotenv";
import express from "express";
import connectDB from "@weather-agent/shared/src/common/db.config.js";
import "@weather-agent/shared/src/common/redis.config.js";
import "./workers/weatherEmail.worker.js"; // Import worker to start listening for jobs
import {
  initMetrics,
  metricsEndpoint,
  contentType,
} from "@weather-agent/shared/src/monitoring/metrics.js";

dotenv.config();

const app = express();

initMetrics("agent-service");

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", contentType);
  res.end(await metricsEndpoint());
});

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
