import { FastifyInstance, fastify } from 'fastify';
import { httpNativeRouter } from '../../../../../src/infra/http/routers/native.router';
import { NativeSDK } from '../../../../../src/infra/native-sdk';

jest.mock('../../../../../src/infra/native-sdk');

describe('Native Router', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = fastify();
    await app.register(httpNativeRouter);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /topics/:topic', () => {
    it('should return messages from the topic', async () => {
      const mockMessages = [{ name: 'test message' }];
      (NativeSDK.prototype.list as jest.Mock).mockResolvedValueOnce(mockMessages);

      const response = await app.inject({
        method: 'GET',
        url: '/topics/test-topic',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockMessages);
      expect(NativeSDK.prototype.list).toHaveBeenCalledWith('test-topic');
    });
  });

  describe('POST /topics/:topic', () => {
    it('should send message to the topic', async () => {
      const message = { name: 'test message' };
      (NativeSDK.prototype.send as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/topics/test-topic',
        payload: message,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual({ status: 'ok' });
      expect(NativeSDK.prototype.send).toHaveBeenCalledWith('test-topic', message);
    });
  });
});
