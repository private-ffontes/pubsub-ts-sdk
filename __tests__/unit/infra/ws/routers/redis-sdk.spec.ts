import { FastifyInstance } from "fastify";
import { wsRedisRouter } from "../../../../../src/infra/ws/routers/redis.router";
import { RedisSDK } from "../../../../../src/infra/redis-sdk";

jest.mock("../../../../../src/infra/redis-sdk");

describe("Redis Router", () => {
  let app: FastifyInstance;
  let connection: { send: jest.Mock };

  beforeEach(() => {
    connection = {
      send: jest.fn(),
    };

    app = {
      get: jest.fn(),
    } as any;
  });

  it("should subscribe to topic and forward messages", async () => {
    const mockMessage = { data: "test" };
    const mockListen = jest.fn().mockImplementation((topic, callback) => {
      callback(mockMessage);
      return Promise.resolve();
    });

    (RedisSDK as unknown as jest.Mock).mockImplementation(() => ({
      listen: mockListen,
    }));

    await wsRedisRouter(app);

    const wsHandler = (app.get as jest.Mock).mock.calls[0][2];
    await wsHandler(connection, {
      query: { topic: "test-topic" },
    });

    expect(mockListen).toHaveBeenCalledWith("test-topic", expect.any(Function));
    expect(connection.send).toHaveBeenCalledWith(JSON.stringify(mockMessage));
  });
});
