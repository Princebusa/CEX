import dotenv from "dotenv";
import redis from "ioredis";

dotenv.config();

export const redisClient = new redis(process.env.REDIS_URL as string);


export default redisClient;