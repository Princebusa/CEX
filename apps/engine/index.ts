import { OrderBook } from "./orderBook";
import  redis  from "redis";

type engines = {
  symbol: String
}
const engines: { [key: string]: OrderBook } = {};

export function getEngine(symbol: string) {
  if (!engines[symbol]) {
    console.log("Creating engine for:", symbol);
    engines[symbol] = new OrderBook(symbol);
  }
  return engines[symbol];
}

async function startEngine(symbol: string) {
  let lastId = "0";

  while (true) {
    const response = await redis.xread(
      "BLOCK",
      0,
      "STREAMS",
      `orders_stream:${symbol}`,
      lastId
    );

    if (!response) continue;

    const [_, messages] = response[0];

    for (const [id, fields] of messages) {
      lastId = id;

      const order = JSON.parse(fields[1]);

      const engine = getEngine(order.symbol);

      await engine.process(order);
    }
  }
}