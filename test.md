# Backend test

The idea is to create an API supported by an SDK. The way the API will work dosnt matter. The SDK must have 3 methods `listen`, `send` and `list`.
The client that calls listen must receive every message sent on the send message , each message must be received with a diference of 60 seconds (Should be global or by topic?). So if you received a message now, the next one can only be received in 60 seconds.

The server must be developed in a way to accept horizontal scaling, so things should still work normally if we have multiple instances running.

Here is the type interface for the SDK.

```typescript
type Message = {
  name: string;
}

abstract class SDK {
  abstract listen(topic: string, callback: (message: Message) => Promise<void>): Promise<void>;
  abstract send(topic: string, message: Message): Promise<void>;
  abstract list(topic: string): Promise<Message[]>;
}
```
