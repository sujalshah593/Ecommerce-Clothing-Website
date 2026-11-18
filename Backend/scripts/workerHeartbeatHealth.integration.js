/*
 * Isolated Redis/Mongo integration check for the worker health contract.
 *
 * Required environment variables:
 *   SHREEJI_REDIS_TEST_URL=redis://127.0.0.1:6379/15
 *   SHREEJI_TEST_MONGO_URL=mongodb://127.0.0.1:27017/shreeji_heartbeat_test?replicaSet=rs0
 *   SHREEJI_WORKER_HEALTH_TEST=1
 *
 * The script never loads Backend/.env. It refuses non-local URLs, writes only the
 * reservation worker heartbeat key in the selected Redis test database, and only
 * pings the supplied MongoDB test database. It does not import queue, inventory,
 * reservation, payment, or application-worker code.
 */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import Redis from "ioredis";
import { RESERVATION_WORKER_HEARTBEAT_KEY } from "../Config/workerHealth.js";

const execFileAsync = promisify(execFile);
const TEST_HEARTBEAT_TTL_MS = 1500;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const assertLocalTestUrls = () => {
  if (process.env.SHREEJI_WORKER_HEALTH_TEST !== "1") {
    throw new Error("Set SHREEJI_WORKER_HEALTH_TEST=1 to run this test");
  }
  const redisUrl = new URL(required("SHREEJI_REDIS_TEST_URL"));
  const mongoUrl = new URL(required("SHREEJI_TEST_MONGO_URL"));
  if (!['127.0.0.1', 'localhost'].includes(redisUrl.hostname) || redisUrl.pathname === "/0" || redisUrl.pathname === "/") {
    throw new Error("SHREEJI_REDIS_TEST_URL must target a local non-default Redis database");
  }
  if (mongoUrl.protocol !== "mongodb:" || !['127.0.0.1', 'localhost'].includes(mongoUrl.hostname) || !/test/i.test(mongoUrl.pathname)) {
    throw new Error("SHREEJI_TEST_MONGO_URL must target a local MongoDB database whose name contains 'test'");
  }
  return { redisUrl: redisUrl.toString(), mongoUrl: mongoUrl.toString() };
};

const runActualHealthcheck = async ({ redisUrl, mongoUrl, expectHealthy }) => {
  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      ["scripts/workerHealthcheck.js"],
      {
        cwd: new URL("..", import.meta.url),
        env: { ...process.env, REDIS_URL: redisUrl, MONGO_URL: mongoUrl },
      },
    );
    if (!expectHealthy) throw new Error(`Health check unexpectedly succeeded: ${stdout}${stderr}`);
    assert.match(stdout, /worker dependencies and reservation recovery heartbeat are healthy/);
  } catch (error) {
    if (expectHealthy) throw error;
    assert.notEqual(error.code, 0, "Health check should fail after heartbeat expiry");
    assert.match(`${error.stdout || ""}${error.stderr || ""}`, /heartbeat is missing or stale/);
  }
};

const main = async () => {
  const { redisUrl, mongoUrl } = assertLocalTestUrls();
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 0, enableReadyCheck: false });
  try {
    await redis.ping();
    await redis.del(RESERVATION_WORKER_HEARTBEAT_KEY);

    // This isolated worker cycle represents a successful recovery pass. It touches
    // only the heartbeat key and intentionally does not call reservation recovery.
    const successfulRecoveryCycle = async () => {
      await redis.set(RESERVATION_WORKER_HEARTBEAT_KEY, new Date().toISOString(), "PX", TEST_HEARTBEAT_TTL_MS);
    };
    const failedRecoveryCycle = async () => {
      throw new Error("simulated recovery failure");
    };

    await successfulRecoveryCycle();
    assert.ok(await redis.get(RESERVATION_WORKER_HEARTBEAT_KEY), "successful recovery must create heartbeat");
    await runActualHealthcheck({ redisUrl, mongoUrl, expectHealthy: true });

    const initialTtl = await redis.pttl(RESERVATION_WORKER_HEARTBEAT_KEY);
    await assert.rejects(failedRecoveryCycle(), /simulated recovery failure/);
    await wait(400);
    const ttlAfterFailure = await redis.pttl(RESERVATION_WORKER_HEARTBEAT_KEY);
    assert.ok(ttlAfterFailure > 0 && ttlAfterFailure < initialTtl, "failed recovery must not refresh the heartbeat TTL");

    await wait(TEST_HEARTBEAT_TTL_MS);
    assert.equal(await redis.get(RESERVATION_WORKER_HEARTBEAT_KEY), null, "stale heartbeat must expire");
    await runActualHealthcheck({ redisUrl, mongoUrl, expectHealthy: false });

    await successfulRecoveryCycle();
    await runActualHealthcheck({ redisUrl, mongoUrl, expectHealthy: true });
    console.log(JSON.stringify({ result: "passed", heartbeatKey: RESERVATION_WORKER_HEARTBEAT_KEY }));
  } finally {
    await redis.del(RESERVATION_WORKER_HEARTBEAT_KEY);
    await redis.quit();
  }
};

main().catch((error) => {
  console.error(`Worker heartbeat health integration test failed: ${error.message}`);
  process.exitCode = 1;
});
