import { FastifyInstance } from "fastify";
import { NativeSDK } from "../../native-sdk";

export async function wsNativeRouter(app: FastifyInstance) {
  const sdk = new NativeSDK(
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
