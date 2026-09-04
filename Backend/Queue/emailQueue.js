import { Queue } from "bullmq";
import { connection } from "../Config/redis.js";

export const emailQueue = new Queue("emailQueue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

/**
 * Enqueue an email job.
 *
 * @param {string} jobName - Descriptive job name used for logging.
 * @param {{ to: string, subject: string, html: string }} payload - Email fields.
 * @param {{ jobId?: string }} [options] - Optional BullMQ job options.
 *
 * Failure mode: if Redis is down, logs a warning but does NOT throw.
 * Critical flows (payment, order creation) have already succeeded by this
 * point; email is a non-critical side effect and must not roll back them.
 */
export const enqueueEmail = async (jobName, payload, options = {}) => {
  try {
    await emailQueue.add(jobName, payload, options);
  } catch (error) {
    // Email delivery failure must never cause the parent HTTP request to fail.
    console.error(
      `[EmailQueue] Failed to enqueue job [${jobName}] to ${payload?.to}: ${error.message}`
    );
  }
};

export const closeEmailQueue = async () => {
  await emailQueue.close();
};
