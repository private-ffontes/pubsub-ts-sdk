import { FastifyInstance } from "fastify";
import { NativeSDK } from "../../native-sdk";

export async function httpNativeRouter(app: FastifyInstance) {
  const sdk = new NativeSDK(
    Number(process.env.SDK_TIME_TO_DELIVERY_IN_SECONDS || "60")
  );

  app.get("/topics/:topic", async (request) => {
    const { topic } = request.params as { topic: string };
    console.log("Requesting messages for topic:", topic);
    const messages = await sdk.list(topic);
    return messages;
  });

  app.post("/topics/:topic", async (request) => {
    const { topic } = request.params as { topic: string };
    console.log("sending message to topic:", topic);
    const body = request.body as { name: string };
    await sdk.send(topic, body);
    return { status: "ok" };
  });
}
