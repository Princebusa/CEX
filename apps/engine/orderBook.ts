import type { order } from "comman";
import { emitOrderbook, emitOrderUpdate, emitTrade } from "./stream";

function matchPrice(order: order): number {
  if (order.type === "market") {
    return order.side === "buy" ? Infinity : 0;
  }
  return order.price;
}

export class OrderBook {
  symbol: string;
  buyOrders: order[];
  sellOrders: order[];

  constructor(symbol: string) {
    this.symbol = symbol;
    this.buyOrders = [];
    this.sellOrders = [];
  }

  sortBooks() {
    this.buyOrders.sort((a, b) => b.price - a.price);
    this.sellOrders.sort((a, b) => a.price - b.price);
  }

  findSellMatch(buy: order): number {
    for (let i = 0; i < this.sellOrders.length; i++) {
      const sell = this.sellOrders[i]!;
      if (buy.price < sell.price) break;
      if (sell.userId !== buy.userId) return i;
    }
    return -1;
  }

  findBuyMatch(sell: order): number {
    for (let i = 0; i < this.buyOrders.length; i++) {
      const buy = this.buyOrders[i]!;
      if (sell.price > buy.price) break;
      if (buy.userId !== sell.userId) return i;
    }
    return -1;
  }

  async process(incoming: order) {
    const order: order = { ...incoming, price: matchPrice(incoming) };

    if (order.side === "buy") {
      await this.matchBuy(order, incoming);
    } else {
      await this.matchSell(order, incoming);
    }
  }

  async cancelOrder(orderId: string, userId: string): Promise<boolean> {
    for (const list of [this.buyOrders, this.sellOrders]) {
      const index = list.findIndex(
        (o) => o.orderId === orderId && o.userId === userId
      );
      if (index === -1) continue;

      const removed = list.splice(index, 1)[0]!;
      const totalQty = removed.originalQty ?? removed.qty + (removed.filledQty ?? 0);

      await emitOrderUpdate({
        orderId: removed.orderId,
        userId: removed.userId,
        symbol: this.symbol,
        status: "cancelled",
        filledQty: removed.filledQty ?? 0,
        qty: totalQty,
      });

      await emitOrderbook(this.symbol, this.buyOrders, this.sellOrders);
      return true;
    }

    return false;
  }

  async matchBuy(order: order, resting: order) {
    let bookChanged = false;
    const originalQty = resting.qty;

    while (order.qty > 0) {
      const sellIndex = this.findSellMatch(order);
      if (sellIndex === -1) break;

      const bestSell = this.sellOrders[sellIndex]!;
      const tradedQty = Math.min(order.qty, bestSell.qty);
      const tradePrice = bestSell.price;
      const sellOriginalQty = bestSell.originalQty ?? bestSell.qty;

      order.qty -= tradedQty;
      bestSell.qty -= tradedQty;
      bestSell.filledQty = (bestSell.filledQty ?? 0) + tradedQty;
      bookChanged = true;

      await emitTrade(
        { orderId: resting.orderId, userId: resting.userId },
        { orderId: bestSell.orderId, userId: bestSell.userId },
        tradedQty,
        tradePrice,
        this.symbol
      );

      await emitOrderUpdate({
        orderId: bestSell.orderId,
        userId: bestSell.userId,
        symbol: this.symbol,
        status: bestSell.qty === 0 ? "filled" : "partially_filled",
        filledQty: bestSell.filledQty,
        qty: sellOriginalQty,
      });

      if (bestSell.qty === 0) {
        this.sellOrders.splice(sellIndex, 1);
      }
    }

    if (order.qty > 0 && resting.type === "limit") {
      const filled = originalQty - order.qty;
      this.buyOrders.push({
        ...resting,
        qty: order.qty,
        originalQty,
        filledQty: filled,
      });
      this.sortBooks();
      bookChanged = true;
      await emitOrderUpdate({
        orderId: resting.orderId,
        userId: resting.userId,
        symbol: this.symbol,
        status: "open",
        filledQty: 0,
        qty: originalQty,
      });
    } else if (order.qty === 0) {
      await emitOrderUpdate({
        orderId: resting.orderId,
        userId: resting.userId,
        symbol: this.symbol,
        status: "filled",
        filledQty: originalQty,
        qty: originalQty,
      });
    } else if (resting.type === "market") {
      const filled = originalQty - order.qty;
      await emitOrderUpdate({
        orderId: resting.orderId,
        userId: resting.userId,
        symbol: this.symbol,
        status: filled > 0 ? "partially_filled" : "cancelled",
        filledQty: filled,
        qty: originalQty,
      });
    }

    if (bookChanged) {
      await emitOrderbook(this.symbol, this.buyOrders, this.sellOrders);
    }
  }

  async matchSell(order: order, resting: order) {
    let bookChanged = false;
    const originalQty = resting.qty;

    while (order.qty > 0) {
      const buyIndex = this.findBuyMatch(order);
      if (buyIndex === -1) break;

      const bestBuy = this.buyOrders[buyIndex]!;
      const tradedQty = Math.min(order.qty, bestBuy.qty);
      const tradePrice = bestBuy.price;
      const buyOriginalQty = bestBuy.originalQty ?? bestBuy.qty;

      order.qty -= tradedQty;
      bestBuy.qty -= tradedQty;
      bestBuy.filledQty = (bestBuy.filledQty ?? 0) + tradedQty;
      bookChanged = true;

      await emitTrade(
        { orderId: bestBuy.orderId, userId: bestBuy.userId },
        { orderId: resting.orderId, userId: resting.userId },
        tradedQty,
        tradePrice,
        this.symbol
      );

      await emitOrderUpdate({
        orderId: bestBuy.orderId,
        userId: bestBuy.userId,
        symbol: this.symbol,
        status: bestBuy.qty === 0 ? "filled" : "partially_filled",
        filledQty: bestBuy.filledQty,
        qty: buyOriginalQty,
      });

      if (bestBuy.qty === 0) {
        this.buyOrders.splice(buyIndex, 1);
      }
    }

    if (order.qty > 0 && resting.type === "limit") {
      const filled = originalQty - order.qty;
      this.sellOrders.push({
        ...resting,
        qty: order.qty,
        originalQty,
        filledQty: filled,
      });
      this.sortBooks();
      bookChanged = true;
      await emitOrderUpdate({
        orderId: resting.orderId,
        userId: resting.userId,
        symbol: this.symbol,
        status: "open",
        filledQty: 0,
        qty: originalQty,
      });
    } else if (order.qty === 0) {
      await emitOrderUpdate({
        orderId: resting.orderId,
        userId: resting.userId,
        symbol: this.symbol,
        status: "filled",
        filledQty: originalQty,
        qty: originalQty,
      });
    } else if (resting.type === "market") {
      const filled = originalQty - order.qty;
      await emitOrderUpdate({
        orderId: resting.orderId,
        userId: resting.userId,
        symbol: this.symbol,
        status: filled > 0 ? "partially_filled" : "cancelled",
        filledQty: filled,
        qty: originalQty,
      });
    }

    if (bookChanged) {
      await emitOrderbook(this.symbol, this.buyOrders, this.sellOrders);
    }
  }
}
