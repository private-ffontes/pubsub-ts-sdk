export type Message = {
  name: string;
};

export interface ISDK {
  listen(
    topic: string,
    callback: (message: Message) => Promise<void>
  ): Promise<void>;
  send(topic: string, message: Message): Promise<void>;
  list(topic: string): Promise<Message[]>;
}
