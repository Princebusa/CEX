import type { order } from "comman";
import { emitOrderbook, emitTrade } from "./stream";

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

  async process(incoming: order) {
    const order: order = { ...incoming, price: matchPrice(incoming) };

    if (order.side === "buy") {
      await this.matchBuy(order, incoming);
    } else {
      await this.matchSell(order, incoming);
    }
  }

  async matchBuy(order: order, resting: order) {
    let bookChanged = false;

    while (order.qty > 0 && this.sellOrders.length > 0) {
      const bestSell = this.sellOrders[0]!;
      if (order.price < bestSell.price) break;

      const tradedQty = Math.min(order.qty, bestSell.qty);
      const tradePrice = bestSell.price;

      order.qty -= tradedQty;
      bestSell.qty -= tradedQty;
      bookChanged = true;

      await emitTrade(order, bestSell, tradedQty, tradePrice, this.symbol);

      if (bestSell.qty === 0) {
        this.sellOrders.shift();
      }
    }

    if (order.qty > 0 && resting.type === "limit") {
      this.buyOrders.push({ ...resting, qty: order.qty });
      this.sortBooks();
      bookChanged = true;
    }

    if (bookChanged) {
      await emitOrderbook(this.symbol, this.buyOrders, this.sellOrders);
    }
  }

  async matchSell(order: order, resting: order) {
    let bookChanged = false;

    while (order.qty > 0 && this.buyOrders.length > 0) {
      const bestBuy = this.buyOrders[0]!;
      if (order.price > bestBuy.price) break;

      const tradedQty = Math.min(order.qty, bestBuy.qty);
      const tradePrice = bestBuy.price;

      order.qty -= tradedQty;
      bestBuy.qty -= tradedQty;
      bookChanged = true;

      await emitTrade(bestBuy, order, tradedQty, tradePrice, this.symbol);

      if (bestBuy.qty === 0) {
        this.buyOrders.shift();
      }
    }

    if (order.qty > 0 && resting.type === "limit") {
      this.sellOrders.push({ ...resting, qty: order.qty });
      this.sortBooks();
      bookChanged = true;
    }

    if (bookChanged) {
      await emitOrderbook(this.symbol, this.buyOrders, this.sellOrders);
    }
  }
}
