import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyWorkerHealth } from "../Services/workerHealthService.js";

test("worker health requires MongoDB, Redis, and a current recovery heartbeat", async () => {
  const calls = [];
  const result = await verifyWorkerHealth({
    mongoAdmin: { ping: async () => calls.push("mongo") },
    redis: { ping: async () => calls.push("redis"), get: async () => "2026-11-16T00:00:00.000Z" },
  });
  assert.deepEqual(calls, ["mongo", "redis"]);
  assert.equal(result.healthy, true);
});

test("worker health fails when the recovery heartbeat is stale or missing", async () => {
  await assert.rejects(
    verifyWorkerHealth({ mongoAdmin: { ping: async () => {} }, redis: { ping: async () => {}, get: async () => null } }),
    /heartbeat is missing or stale/,
  );
});
