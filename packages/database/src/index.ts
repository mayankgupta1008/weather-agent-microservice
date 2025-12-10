import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.config";
import { redisClient } from "./config/redis.config";

const initializeServices = async () => {
  await connectDB();
  await redisClient.ping();
};

initializeServices();
