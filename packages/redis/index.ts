import redis from 'ioredis';

export const redisClient = new redis(process.env.REDIS_URL as string);


export default redisClient;