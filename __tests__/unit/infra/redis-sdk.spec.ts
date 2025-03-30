import { RedisSDK } from "../../../src/infra/redis-sdk";
import { redisClient } from "../../../src/infra/db/redis";

jest.mock("../../../src/infra/db/redis", () => ({
  redisClient: {
    rPop: jest.fn(),
    lPush: jest.fn(),
    lRange: jest.fn(),
  },
}));

describe("RedisSDK", () => {
  let sdk: RedisSDK;

  beforeEach(() => {
    sdk = new RedisSDK(1);
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("send", () => {
    it("should push message to Redis list", async () => {
      const message = { name: "test-message" };
      sdk.send("test-topic", message);

      expect(redisClient.lPush).toHaveBeenCalledWith(
        "test-topic",
        JSON.stringify(message)
      );
    });
  });

  describe("list", () => {
    it("should return parsed messages from Redis", async () => {
      const mockMessages = [
        JSON.stringify({ name: "message1" }),
        JSON.stringify({ name: "message2" }),
      ];

      (redisClient.lRange as jest.Mock).mockResolvedValue(mockMessages);

      const messages = await sdk.list("test-topic");

      expect(redisClient.lRange).toHaveBeenCalledWith("test-topic", 0, -1);
      expect(messages).toEqual([{ name: "message1" }, { name: "message2" }]);
    });

    it("should return empty array when no messages exist", async () => {
      (redisClient.lRange as jest.Mock).mockResolvedValue([]);

      const messages = await sdk.list("test-topic");
      expect(messages).toEqual([]);
    });
  });

  describe("listen", () => {
    it("should process messages in order", async () => {
      const processedMessages: string[] = [];
      const callback = jest.fn(async (message: { name: string }) => {
        processedMessages.push(message.name);
      });

      (redisClient.rPop as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify({ name: "message1" }))
        .mockResolvedValueOnce(JSON.stringify({ name: "message2" }))
        .mockResolvedValue(null);

      await sdk.listen("test-topic", callback);

      await jest.advanceTimersByTimeAsync(1);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(processedMessages).toEqual(["message1"]);

      await jest.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(processedMessages).toEqual(["message1", "message2"]);
    });

    it("should wait when no messages are available", async () => {
      const callback = jest.fn();
      (redisClient.rPop as jest.Mock).mockResolvedValue(null);

      sdk.listen("test-topic", callback);

      jest.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();
      expect(redisClient.rPop).toHaveBeenCalled();
    });
  });
});
