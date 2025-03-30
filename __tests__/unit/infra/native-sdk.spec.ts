import { NativeSDK } from '../../../src/infra/native-sdk';

describe('NativeSDK', () => {
  let sdk: NativeSDK;

  beforeEach(() => {
    NativeSDK.topics = {};
    sdk = new NativeSDK(1);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('send', () => {
    it('should add message to topic queue', async () => {
      const message = { name: 'test-message' };
      await sdk.send('test-topic', message);
      
      const messages = await sdk.list('test-topic');
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    it('should handle multiple messages in same topic', async () => {
      await sdk.send('test-topic', { name: 'message1' });
      await sdk.send('test-topic', { name: 'message2' });
      
      const messages = await sdk.list('test-topic');
      expect(messages).toHaveLength(2);
      expect(messages).toEqual([
        { name: 'message1' },
        { name: 'message2' }
      ]);
    });
  });

  describe('list', () => {
    it('should return empty array for new topic', async () => {
      const messages = await sdk.list('non-existent-topic');
      expect(messages).toEqual([]);
    });

    it('should return all messages in topic', async () => {
      await sdk.send('test-topic', { name: 'message1' });
      await sdk.send('test-topic', { name: 'message2' });
      
      const messages = await sdk.list('test-topic');
      expect(messages).toHaveLength(2);
    });
  });

  describe('listen', () => {
    it('should process messages in order', async () => {
      const processedMessages: string[] = [];
      const callback = jest.fn(async (message: { name: string }) => {
        processedMessages.push(message.name);
      });

      await sdk.send('test-topic', { name: 'message1' });
      await sdk.send('test-topic', { name: 'message2' });
      
      sdk.listen('test-topic', callback);
      
      jest.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(processedMessages).toEqual(['message1']);

      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(processedMessages).toEqual(['message1', 'message2']);
    });

    it('should wait when no messages are available', async () => {
      const callback = jest.fn();
      sdk.listen('test-topic', callback);
      
      jest.advanceTimersByTime(1);
      expect(callback).not.toHaveBeenCalled();

      await sdk.send('test-topic', { name: 'message1' });
      jest.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
