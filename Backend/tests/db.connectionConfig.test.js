import assert from "node:assert/strict";
import { test } from "node:test";
import { CONNECTION_ROLES, getMongoConnectionOptions } from "../Config/db.js";

const connectionVariableNames = [
  "MONGO_API_MAX_POOL_SIZE",
  "MONGO_WORKER_MAX_POOL_SIZE",
  "MONGO_MAX_IDLE_TIME_MS",
  "MONGO_WAIT_QUEUE_TIMEOUT_MS",
];

const withEnvironment = (values, operation) => {
  const previous = Object.fromEntries(connectionVariableNames.map((name) => [name, process.env[name]]));
  try {
    for (const name of connectionVariableNames) {
      if (Object.hasOwn(values, name)) process.env[name] = values[name];
      else delete process.env[name];
    }
    operation();
  } finally {
    for (const name of connectionVariableNames) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
};

test("uses bounded, role-specific MongoDB pools with idle and wait-queue limits", () => {
  withEnvironment({}, () => {
    assert.deepEqual(getMongoConnectionOptions(CONNECTION_ROLES.API), {
      maxPoolSize: 30,
      minPoolSize: 0,
      maxIdleTimeMS: 60_000,
      waitQueueTimeoutMS: 10_000,
    });
    assert.equal(getMongoConnectionOptions(CONNECTION_ROLES.WORKER).maxPoolSize, 15);
  });
});

test("accepts only positive integer MongoDB connection overrides", () => {
  withEnvironment({
    MONGO_API_MAX_POOL_SIZE: "40",
    MONGO_WORKER_MAX_POOL_SIZE: "not-a-number",
    MONGO_MAX_IDLE_TIME_MS: "45000",
    MONGO_WAIT_QUEUE_TIMEOUT_MS: "0",
  }, () => {
    const api = getMongoConnectionOptions(CONNECTION_ROLES.API);
    const worker = getMongoConnectionOptions(CONNECTION_ROLES.WORKER);
    assert.equal(api.maxPoolSize, 40);
    assert.equal(api.maxIdleTimeMS, 45_000);
    assert.equal(api.waitQueueTimeoutMS, 10_000);
    assert.equal(worker.maxPoolSize, 15);
  });
});
