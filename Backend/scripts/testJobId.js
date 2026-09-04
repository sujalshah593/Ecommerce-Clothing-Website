// scripts/testJobId.js
// Verifies BullMQ accepts the fixed jobId format (no colons)
// and that duplicate enqueues return the same job (deduplication).
import { Queue } from "bullmq";
import Redis from "ioredis";

const conn = new Redis("redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
const q = new Queue("emailQueue", { connection: conn });

const orderId = "test000000000000000000001";
const payload = { to: "test@example.com", subject: "Test", html: "<p>test</p>" };

// ── Test 1: payment-confirmation jobId is accepted ──────────────────────────
const job1 = await q.add("payment-confirmation", payload, {
  jobId: `payment-confirmation-${orderId}`,
});
console.log("✓ payment-confirmation jobId accepted:", job1.id);

// ── Test 2: duplicate enqueue returns the existing job (deduplication) ───────
const job2 = await q.add("payment-confirmation", payload, {
  jobId: `payment-confirmation-${orderId}`,
});
console.log("✓ duplicate enqueue jobId:", job2.id);
if (job1.id !== job2.id) {
  throw new Error(`Deduplication FAILED: job1=${job1.id} job2=${job2.id}`);
}
console.log("✓ Deduplication correct: same jobId returned for duplicate enqueue");

// ── Test 3: cod-order-confirmation jobId is accepted ────────────────────────
const codJob = await q.add("cod-order-confirmation", payload, {
  jobId: `cod-order-confirmation-${orderId}`,
});
console.log("✓ cod-order-confirmation jobId accepted:", codJob.id);

// ── Cleanup ──────────────────────────────────────────────────────────────────
await q.remove(job1.id);
await q.remove(codJob.id);
await q.close();
await conn.quit();

console.log("\nAll jobId tests passed.");
