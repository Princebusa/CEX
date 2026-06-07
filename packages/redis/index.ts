import "dotenv/config";
import Redis from "ioredis";


export const redisStream = new Redis(process.env.REDIS_URL as string);

export const publisher = redisStream.duplicate();
export const subscriber = redisStream.duplicate();

redisStream.on("connect", () => {
  console.log("Redis connected");
});

redisStream.on("error", (err) => {
  console.error("Redis error:", err.message);
});

