import { Worker } from "bullmq";
import { connection } from "../Config/redis.js";
import { sendEmail } from "../utils/sendEmail.js";

const processEmailJob = async (job) => {
  const startTime = Date.now();
  const { to, subject } = job.data;

  console.log(
    `[Worker] Processing job id=${job.id} name=${job.name} to=${to} subject="${subject}" attempt=${job.attemptsMade + 1}`
  );

  const { to: emailTo, subject: emailSubject, html } = job.data;

  if (!emailTo || !emailSubject || !html) {
    // Permanent failure — do not retry malformed jobs.
    const err = new Error(`[Worker] Malformed job data: missing to/subject/html`);
    err.name = "UnrecoverableError";
    throw err;
  }

  await sendEmail({ to: emailTo, subject: emailSubject, html });

  const duration = Date.now() - startTime;
  console.log(
    `[Worker] Job id=${job.id} name=${job.name} completed in ${duration}ms`
  );
};

export const createEmailWorker = () => {
  const worker = new Worker("emailQueue", processEmailJob, {
    connection,
    concurrency: 5,
  });

  worker.on("completed", (job) => {
    console.log(`[Worker] Job id=${job.id} name=${job.name} succeeded`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[Worker] Job id=${job?.id} name=${job?.name} failed (attempt ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`
    );
  });

  worker.on("error", (err) => {
    console.error(`[Worker] Worker-level error: ${err.message}`);
  });

  return worker;
};
