import { publisher, redisStream } from "redis";
import { prisma } from "db";

type TradeEvent = {
  symbol: string;
  tradeId: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  quantity: number;
};

type OrderUpdateEvent = {
  orderId: string;
  userId: string;
  symbol: string;
  status: "open" | "filled" | "partially_filled" | "cancelled";
  filledQty: number;
  qty: number;
};

const SETTLEMENT_STREAM = "settlements_stream";
const SETTLEMENT_GROUP = "settlement_group";

const settlementRedis = redisStream.duplicate();

function shouldApplyEngineUpdate(
  currentStatus: string,
  currentFilledQty: number,
  update: OrderUpdateEvent
) {
  // Settlement owns fill state; engine only notifies resting orders
  if (update.status !== "open") return false;
  if (currentStatus === "filled" || currentStatus === "partially_filled") return false;
  if (currentFilledQty > 0) return false;
  return true;
}

async function getOrCreateMarket(symbol: string) {
  let market = await prisma.market.findFirst({
    where: { symbol: { equals: symbol, mode: "insensitive" } },
  });
  if (!market) {
    market = await prisma.market.create({ data: { symbol } });
  }
  return market;
}

async function ensureWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    await prisma.wallet.create({ data: { userId, balance: 100000 } });
  }
}

async function publishOrderUpdate(order: {
  id: string;
  userId: string;
  symbol: string;
  qty: number;
  filledQty: number;
  status: string;
}) {
  await publisher.publish(
    "order_updates",
    JSON.stringify({
      orderId: order.id,
      userId: order.userId,
      symbol: order.symbol,
      status: order.status,
      filledQty: order.filledQty,
      qty: order.qty,
      timestamp: Date.now(),
    })
  );
}

export async function handleTrade(trade: TradeEvent, options?: { notify?: boolean }) {
  const notify = options?.notify ?? true;
  if (!trade.buyerId || !trade.sellerId || !trade.symbol) {
    throw new Error("Invalid trade event: " + JSON.stringify(trade));
  }

  const lockKey = `settled:${trade.tradeId}`;
  const already = await redisStream.get(lockKey);
  if (already) {
    console.log(`Trade ${trade.tradeId} already settled, skip`);
    return;
  }

  const market = await getOrCreateMarket(trade.symbol);
  const cost = trade.price * trade.quantity;

  await ensureWallet(trade.buyerId);
  await ensureWallet(trade.sellerId);

  const updatedOrders: Array<{
    id: string;
    userId: string;
    symbol: string;
    qty: number;
    filledQty: number;
    status: string;
  }> = [];

  await prisma.$transaction(async (tx) => {
    for (const orderId of [trade.buyOrderId, trade.sellOrderId]) {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) continue;

      const filledQty = order.filledQty + trade.quantity;
      const status = filledQty >= order.qty ? "filled" : "partially_filled";

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { filledQty, status },
      });

      updatedOrders.push({
        id: updated.id,
        userId: updated.userId,
        symbol: updated.symbol,
        qty: updated.qty,
        filledQty: updated.filledQty,
        status: updated.status,
      });
    }

    const buyerWallet = await tx.wallet.findUnique({
      where: { userId: trade.buyerId },
    });
    if (buyerWallet) {
      await tx.wallet.update({
        where: { userId: trade.buyerId },
        data: { balance: buyerWallet.balance - cost },
      });
    }

    const sellerWallet = await tx.wallet.findUnique({
      where: { userId: trade.sellerId },
    });
    if (sellerWallet) {
      await tx.wallet.update({
        where: { userId: trade.sellerId },
        data: { balance: sellerWallet.balance + cost },
      });
    }

    const buyerPos = await tx.position.findFirst({
      where: { userId: trade.buyerId, marketId: market.id, side: "buy" },
    });
    if (buyerPos) {
      const newQty = buyerPos.qty + trade.quantity;
      const avgPrice =
        (buyerPos.price * buyerPos.qty + trade.price * trade.quantity) / newQty;
      await tx.position.update({
        where: { id: buyerPos.id },
        data: { qty: newQty, price: avgPrice },
      });
    } else {
      await tx.position.create({
        data: {
          userId: trade.buyerId,
          marketId: market.id,
          side: "buy",
          qty: trade.quantity,
          price: trade.price,
        },
      });
    }

    let sellQty = trade.quantity;

    const sellerLong = await tx.position.findFirst({
      where: { userId: trade.sellerId, marketId: market.id, side: "buy" },
    });
    if (sellerLong) {
      const closed = Math.min(sellerLong.qty, sellQty);
      sellQty -= closed;
      if (sellerLong.qty === closed) {
        await tx.position.delete({ where: { id: sellerLong.id } });
      } else {
        await tx.position.update({
          where: { id: sellerLong.id },
          data: { qty: sellerLong.qty - closed },
        });
      }
    }

    if (sellQty > 0) {
      const sellerShort = await tx.position.findFirst({
        where: { userId: trade.sellerId, marketId: market.id, side: "sell" },
      });
      if (sellerShort) {
        const newQty = sellerShort.qty + sellQty;
        const avgPrice =
          (sellerShort.price * sellerShort.qty + trade.price * sellQty) / newQty;
        await tx.position.update({
          where: { id: sellerShort.id },
          data: { qty: newQty, price: avgPrice },
        });
      } else {
        await tx.position.create({
          data: {
            userId: trade.sellerId,
            marketId: market.id,
            side: "sell",
            qty: sellQty,
            price: trade.price,
          },
        });
      }
    }

    await tx.history.create({
      data: {
        userId: trade.buyerId,
        side: "buy",
        qty: trade.quantity,
        price: trade.price,
        exitPrice: trade.price,
      },
    });

    await tx.history.create({
      data: {
        userId: trade.sellerId,
        side: "sell",
        qty: trade.quantity,
        price: trade.price,
        exitPrice: trade.price,
      },
    });
  });

  await redisStream.set(lockKey, "1", "EX", 86400);

  if (notify) {
    for (const order of updatedOrders) {
      await publishOrderUpdate(order);
    }
  }

  console.log(
    `Settled trade ${trade.symbol} qty=${trade.quantity} @ ${trade.price} → positions updated`
  );
}

async function handleOrderUpdate(update: OrderUpdateEvent) {
  const existing = await prisma.order.findUnique({
    where: { id: update.orderId },
  });

  if (!existing) return;

  if (update.status === "cancelled") {
    if (existing.status === "filled") return;
    await prisma.order.update({
      where: { id: update.orderId },
      data: {
        status: "cancelled",
        filledQty: Math.max(existing.filledQty, update.filledQty),
      },
    });
    return;
  }

  if (
    existing.type === "market" &&
    (update.status === "filled" || update.status === "partially_filled")
  ) {
    if (existing.status === "filled" || existing.status === "cancelled") return;
    await prisma.order.update({
      where: { id: update.orderId },
      data: {
        status: update.status,
        filledQty: Math.max(existing.filledQty, update.filledQty),
      },
    });
    return;
  }

  if (!shouldApplyEngineUpdate(existing.status, existing.filledQty, update)) return;

  await prisma.order.update({
    where: { id: update.orderId },
    data: { status: "open" },
  });
}

async function initSettlementGroup() {
  try {
    await settlementRedis.xgroup(
      "CREATE",
      SETTLEMENT_STREAM,
      SETTLEMENT_GROUP,
      "0",
      "MKSTREAM"
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("BUSYGROUP")) throw err;
  }
}

async function settlementConsumerLoop() {
  const consumer = `settler-${process.pid}`;

  while (true) {
    try {
      const res = (await settlementRedis.xreadgroup(
        "GROUP",
        SETTLEMENT_GROUP,
        consumer,
        "COUNT",
        10,
        "BLOCK",
        5000,
        "STREAMS",
        SETTLEMENT_STREAM,
        ">"
      )) as [string, [string, string[]][]][] | null;

      if (!res) continue;

      for (const [, messages] of res) {
        for (const [id, fields] of messages) {
          try {
            const trade = JSON.parse(fields[1]!) as TradeEvent;
            await handleTrade(trade);
            await settlementRedis.xack(SETTLEMENT_STREAM, SETTLEMENT_GROUP, id);
          } catch (err) {
            console.error("Settlement error:", err);
          }
        }
      }
    } catch (err) {
      console.error("Settlement loop error:", err);
    }
  }
}

export async function startSettlement() {
  await initSettlementGroup();

  const sub = redisStream.duplicate();
  await sub.subscribe("order_updates");

  sub.on("message", (_channel, message) => {
    try {
      const update = JSON.parse(message) as OrderUpdateEvent;
      handleOrderUpdate(update).catch((err) =>
        console.error("Order update error:", err)
      );
    } catch (err) {
      console.error("Parse order update error:", err);
    }
  });

  settlementConsumerLoop();

  console.log("Settlement consumer started (settlements_stream)");
}
