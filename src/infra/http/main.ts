import { initClient } from "../db/redis";
import bootstrap from "./server";

initClient().then(async () => {
  await bootstrap();
});
