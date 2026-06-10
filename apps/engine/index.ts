import dotenv from "dotenv";

import { redisStream } from "redis";

import type { order } from "comman";

import { OrderBook } from "./orderBook";



dotenv.config();



const STREAM = "orders_stream";

const GROUP = "engine_group";

const CONSUMER = `consumer-${process.pid}`;



const orderbooks: Record<string, OrderBook> = {};



async function init() {

  try {

    await redisStream.xgroup("CREATE", STREAM, GROUP, "0", "MKSTREAM");

  } catch (err: any) {

    if (!err.message.includes("BUSYGROUP")) {

      throw err;

    }

  }

}



function getOrderBook(symbol: string): OrderBook {

  if (!orderbooks[symbol]) {

    orderbooks[symbol] = new OrderBook(symbol);

    console.log(`Order book created for ${symbol}`);

  }

  return orderbooks[symbol];

}



type StreamMessage =

  | { type: "cancel"; orderId: string; userId: string; symbol: string }

  | { type: "order"; order: order }

  | { order: order }

  | order;



function parseMessage(fields: string[]): StreamMessage {

  return JSON.parse(fields[1]!) as StreamMessage;

}



function extractOrder(raw: StreamMessage): order {

  if ("type" in raw && raw.type === "order") return raw.order;

  if ("order" in raw && raw.order) return raw.order;

  return raw as order;

}



async function start() {

  await init();



  while (true) {

    try {

      const res = (await redisStream.xreadgroup(

        "GROUP",

        GROUP,

        CONSUMER,

        "COUNT",

        10,

        "BLOCK",

        5000,

        "STREAMS",

        STREAM,

        ">"

      )) as [string, [string, string[]][]][] | null;



      if (!res) continue;



      for (const [, messages] of res) {

        for (const [id, fields] of messages) {

          try {

            const raw = parseMessage(fields);



            if ("type" in raw && raw.type === "cancel") {

              const orderbook = getOrderBook(raw.symbol);

              await orderbook.cancelOrder(raw.orderId, raw.userId);

              await redisStream.xack(STREAM, GROUP, id);

              continue;

            }



            const incoming = extractOrder(raw);

            if (!incoming.symbol) {

              throw new Error("Order missing symbol");

            }



            const cancelled = await redisStream.get(

              `order_cancelled:${incoming.orderId}`

            );

            if (cancelled) {

              await redisStream.xack(STREAM, GROUP, id);

              continue;

            }



            const orderbook = getOrderBook(incoming.symbol);

            await orderbook.process(incoming);

            await redisStream.xack(STREAM, GROUP, id);

          } catch (err) {

            console.error("Processing error:", err);

          }

        }

      }

    } catch (err) {

      console.error("Worker loop error:", err);

    }

  }

}



start();

