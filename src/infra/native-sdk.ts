import { ISDK, Message } from "../application/interfaces/sdk.interface";
/**
 * This class will not handle proper with horizontal scaling once the topics are created in memory
 * - When the process crashes, all the data on topic will be lost
 * - When the process is scaled horizontally, each instance will have its own topics and messages
 */
export class NativeSDK implements ISDK {
  static topics: Record<
    string,
    { messages: Array<Message>; latestProcessedTimestamp?: number }
  > = {};

  constructor(private readonly processIntervalInSeconds: number) {}

  private static getOrInitializeTopic(topic: string) {
    const existingTopic = NativeSDK.topics[topic];
    if (!existingTopic) {
      NativeSDK.topics[topic] = {
        messages: [],
        latestProcessedTimestamp: 0,
      };
    }
    return NativeSDK.topics[topic];
  }

  async listen(
    topic: string,
    callback: (message: { name: string }) => Promise<void>
  ): Promise<void> {
    // Implementation for listening to messages
    console.log(`Listening on topic: ${topic}`);

    const existingTopic = NativeSDK.getOrInitializeTopic(topic);
    const handle = () => {
      const existingMessage = existingTopic.messages.shift();
      if (existingMessage) {
        callback(existingMessage);
        setTimeout(handle, this.processIntervalInSeconds * 1000);
      } else {
        setTimeout(handle, 100);
      }
    };
    handle();
  }

  async send(topic: string, message: { name: string }): Promise<void> {
    // Implementation for sending a message
    console.log(`Sending message to topic: ${topic}`, message);
    const existingTopic = NativeSDK.getOrInitializeTopic(topic);
    existingTopic.messages.push(message);
  }

  async list(topic: string): Promise<{ name: string }[]> {
    // Implementation for listing messages
    console.log(`Listing messages from topic: ${topic}`);
    const existingTopic = NativeSDK.getOrInitializeTopic(topic);
    return existingTopic.messages;
  }
}
