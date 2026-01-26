const redis = require("redis");

let client = null;

const initRedis = async () => {
  if (client) return client;

  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    client.on("error", (err) => console.log("Redis Client Error", err));

    await client.connect();

    console.log("Redis connected successfully");
    return client;
  } catch (err) {
    console.log(
      "Redis connection failed (optional, proceeding without cache):",
      err.message
    );
    client = null; // Ensure client is null so we don't try to use it
    return null;
  }
};

const get = async (key) => {
  if (!client) return null;
  try {
    return await client.get(key);
  } catch (err) {
    return null; // Fail silently
  }
};

const set = async (key, value, duration = 3600) => {
  if (!client) return;
  try {
    await client.set(key, value, {
      EX: duration,
    });
  } catch (err) {
    // Fail silently
  }
};

const del = async (key) => {
  if (!client) return;
  try {
    await client.del(key);
  } catch (err) {
    // Fail silently
  }
};

// Initialize on load (non-blocking) - skip in test mode
if (process.env.NODE_ENV !== "test") {
  // initRedis();
}

module.exports = {
  get,
  set,
  del,
  client, // Exported just in case direct access is needed, but prefer wrappers
};
