import Fastify from "fastify";
import FasftifyWebsocket from "@fastify/websocket";
import { httpNativeRouter } from "./routers/native.router";
import { wsNativeRouter } from "../ws/routers/native.router";
import { httpRedisRouter } from "./routers/redis.router";
import { wsRedisRouter } from "../ws/routers/redis.router";

export default async function bootstrap() {
  const app = Fastify({ logger: true });

  app.register(FasftifyWebsocket);
  app.register(httpNativeRouter, { prefix: "/api/native-sdk" });
  app.register(wsNativeRouter, { prefix: "/ws/native-sdk" });
  app.register(httpRedisRouter, { prefix: "/api/redis-sdk" });
  app.register(wsRedisRouter, { prefix: "/ws/redis-sdk" });

  app.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server listening at ${address}`);
  });
}
