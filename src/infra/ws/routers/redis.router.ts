import { FastifyInstance } from "fastify";
import { RedisSDK } from "../../redis-sdk";

export async function wsRedisRouter(app: FastifyInstance) {
  const sdk = new RedisSDK(
    Number(process.env.SDK_TIME_TO_DELIVERY_IN_SECONDS || "60")
  );

  app.get(
    "/topics/subscribe",
    { websocket: true },
    async (connection, request) => {
      const { topic } = request.query as { topic: string };
      await sdk.listen(topic, async (message) => {
        connection.send(JSON.stringify(message));
      });
    }
  );
}
