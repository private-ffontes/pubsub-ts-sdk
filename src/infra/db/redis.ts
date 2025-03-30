import { createClient, RedisClientType } from "redis";

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL,
});

export async function initClient() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}
