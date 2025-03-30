import { FastifyInstance } from "fastify";
import { wsNativeRouter } from "../../../../../src/infra/ws/routers/native.router";
import { NativeSDK } from "../../../../../src/infra/native-sdk";

jest.mock("../../../../../src/infra/native-sdk");

describe("Native Router", () => {
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

    (NativeSDK as unknown as jest.Mock).mockImplementation(() => ({
      listen: mockListen,
    }));

    await wsNativeRouter(app);

    const wsHandler = (app.get as jest.Mock).mock.calls[0][2];
    await wsHandler(connection, {
      query: { topic: "test-topic" },
    });

    expect(mockListen).toHaveBeenCalledWith("test-topic", expect.any(Function));
    expect(connection.send).toHaveBeenCalledWith(JSON.stringify(mockMessage));
  });
});
