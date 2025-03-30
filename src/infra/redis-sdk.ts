import { ISDK } from "../application/interfaces/sdk.interface";
import { redisClient } from "./db/redis";

/**
 * Redis could be a good strategy
 * - Highly available through clustering mode
 * - Very fast to retrive/write items
 * - Redis pub/sub could be used to handle the messages if need
 */
export class RedisSDK implements ISDK {
  constructor(private readonly processIntervalInSeconds: number) {}

  async listen(
    topic: string,
    callback: (message: { name: string }) => Promise<void>
  ): Promise<void> {
    console.log(`Listening on topic: ${topic}`);
    const handle = async () => {
      const existingMessage = await redisClient.rPop(topic);
      if (existingMessage) {
        callback(JSON.parse(existingMessage));
        setTimeout(handle, this.processIntervalInSeconds * 1000);
      } else {
        setTimeout(handle, 100);
      }
    };

    return handle();
  }

  async send(topic: string, message: { name: string }): Promise<void> {
    await redisClient.lPush(topic, JSON.stringify(message));
  }

  async list(topic: string): Promise<{ name: string }[]> {
    const messages = await redisClient.lRange(topic, 0, -1);
    return messages.map((msg) => JSON.parse(msg));
  }
}
