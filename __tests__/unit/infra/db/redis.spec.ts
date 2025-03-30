import * as redis from "../../../../src/infra/db/redis";
import { createClient } from "redis";

jest.mock("redis", () => ({
  createClient: jest.fn(() => ({
    on: jest.fn(),
    connect: jest.fn(),
    isOpen: false,
  })),
}));

const mockedClient = jest.mocked(createClient);
const redisUrl = "mockuri";
process.env.REDIS_URL = redisUrl;
describe("Redis Client", () => {
  let redisModule: typeof redis;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModulesAsync(async () => {
      redisModule = await import("../../../../src/infra/db/redis");
    });
  });

  it("should create redis client with correct URL", async () => {
    await redisModule.initClient();
    expect(createClient).toHaveBeenCalledWith({
      url: redisUrl,
    });
  });

  describe("initClient", () => {
    it("should connect if client is not open", async () => {
      const client = await redisModule.initClient();
      expect(client.connect).toHaveBeenCalled();
    });

    it("should not connect if client is already open", async () => {
      mockedClient.mockReturnValueOnce({
        isOpen: true,
        on: jest.fn(),
        connect: jest.fn(),
      } as any);
      await jest.isolateModulesAsync(async () => {
        redisModule = await import("../../../../src/infra/db/redis");
      });

      const client = await redisModule.initClient();
      expect(client.connect).not.toHaveBeenCalled();
    });
  });
});
