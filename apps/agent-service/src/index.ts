import express from "express";
import connectDB from "./lib/db";
import { redisClient } from "./lib/redis";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();
  await redisClient.connect();
  app.listen(PORT, () => {
    console.log(
      "Weather agent service connected to DB and is running on PORT:",
      PORT
    );
  });
};

startServer();
