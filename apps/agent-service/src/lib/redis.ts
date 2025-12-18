import { Redis } from "ioredis";

// Redis plain object used by bullMQ
export const redisConnection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
};

// Redis instance for direct use
export const redisClient = new Redis(redisConnection);

redisClient.on("error", (error) => {
  console.error("Redis error inside redis.config file: ", error);
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});
