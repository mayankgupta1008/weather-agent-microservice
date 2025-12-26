import { Worker, Job } from "bullmq";
import { redisConnection } from "@weather-agent/shared/src/common/redis.config.js";
import { WeatherEmailJobData } from "@weather-agent/shared/src/common/queue.config.js";
import { weatherEmailAgent } from "../agents/agent.js";

export const weatherEmailWorker = new Worker<WeatherEmailJobData>(
  "weather-email-queue",
  async (job: Job<WeatherEmailJobData>) => {
    console.log(`\n🚀 Processing job ${job.id}...`);
    console.log(
      `📧 Sending weather email for ${job.data.city} to ${job.data.recipientEmail}`
    );
    try {
      const result = await weatherEmailAgent.invoke({
        city: job.data.city,
        recipientEmail: job.data.recipientEmail,
      });
      console.log(`✅ Job ${job.id} completed successfully!`);
      console.log(`Result: ${result}`);
      return result;
    } catch (error) {
      console.error("Error inside worker file", error);
      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);

weatherEmailWorker.on("completed", (job: Job<WeatherEmailJobData>) => {
  console.log(`\n🚀 Job ${job.id} completed successfully!`);
  console.log(`Result: ${job.data}`);
});

weatherEmailWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error: ${err.message}`);
});

weatherEmailWorker.on("error", (err) => {
  console.error(`❌ Worker error: ${err.message}`);
});

console.log("✅ Weather Email Worker is running and waiting for jobs...");
