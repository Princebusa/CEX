import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Redis from "ioredis";

const root = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(root, ".env") });
dotenv.config({ path: resolve(root, "../../apps/backend/.env") });
dotenv.config({ path: resolve(root, "../../.env") });

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is not set — check apps/backend/.env");
}

export const redisStream = new Redis(redisUrl);

export const publisher = redisStream.duplicate();
export const subscriber = redisStream.duplicate();

redisStream.on("connect", () => {
  console.log("Redis connected");
});

redisStream.on("error", (err) => {
  console.error("Redis error:", err.message);
});

