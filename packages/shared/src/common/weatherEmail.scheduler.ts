// packages/shared/src/queues/weatherEmail.scheduler.ts
import { weatherEmailQueue } from "./queue.config.js";

export async function scheduleWeatherEmail(
  city: string,
  recipientEmail: string,
  cronPattern: string = "0 17 * * *",
  schedulerId?: string
) {
  try {
    const jobId = schedulerId || `weather-${Date.now()}`;
    await weatherEmailQueue.upsertJobScheduler(
      jobId,
      { pattern: cronPattern },
      { data: { city, recipientEmail } }
    );
    console.log(`✅ Scheduled weather email for ${city}`);
    console.log(`   Pattern: ${cronPattern}`);
    return jobId;
  } catch (error) {
    console.log("Error inside scheduleWeatherEmail", error);
    throw error;
  }
}

export async function removeScheduledJobs(schedulerId: string) {
  try {
    const removed = await weatherEmailQueue.removeJobScheduler(schedulerId);
    if (removed) {
      console.log(`✅ Removed scheduled job with key: ${schedulerId}`);
    } else {
      console.log(`⚠️ No scheduled job found with ID: ${schedulerId}`);
    }
    return removed;
  } catch (error) {
    console.log("Error inside removeScheduledJobs", error);
    throw error;
  }
}

export async function getScheduledJobs() {
  try {
    const schedulers = await weatherEmailQueue.getJobSchedulers();
    schedulers.forEach((scheduler) => {
      console.log(`   - Key: ${scheduler.key}`);
      console.log(`     Pattern: ${scheduler.pattern}`);
    });
    return schedulers;
  } catch (error) {
    console.log("Error inside getScheduledJobs", error);
    throw error;
  }
}

export async function removeAllScheduledJobs() {
  try {
    const schedulers = await weatherEmailQueue.getJobSchedulers();
    let schedulersRemoved = 0;

    for (const scheduler of schedulers) {
      if (!scheduler.key) continue;

      const removed = await weatherEmailQueue.removeJobScheduler(scheduler.key);
      if (removed) {
        console.log(`🗑️ Removed scheduler: ${scheduler.key}`);
        schedulersRemoved++;
      }
    }

    await weatherEmailQueue.drain();
    console.log(`🗑️ Drained all waiting and delayed jobs from the queue`);

    return {
      schedulersRemoved,
      message: "All schedulers removed and queue drained",
    };
  } catch (error) {
    console.error("Error inside removeAllScheduledJobs", error);
    throw error;
  }
}
