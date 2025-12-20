import express from "express";
import connectDB from "@weather-agent/shared/src/common/db.config.js";
import "@weather-agent/shared/src/common/redis.config.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

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
