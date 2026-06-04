import type{ order} from "comman";
import { emitOrderbook, emitTrade } from "./stream";

export class OrderBook {

  symbol: string;
  buyOrders: order[];
  sellOrders: order[];

  constructor(symbol: string) {
    this.symbol = symbol;
    this.buyOrders  = [];
    this.sellOrders = [];
  }

  sortBooks() {
    this.buyOrders.sort((a, b) => b.price - a.price);
    this.sellOrders.sort((a, b) => a.price - b.price);
  }

  async process(order: order) {
    if (order.side === "BUY") {
      await this.matchBuy(order);
    } else {
      await this.matchSell(order);
    }
  }

  async matchBuy(order: order) {
    while (order.qty > 0) {
      if (this.sellOrders.length === 0) break;

      let bestSell = this.sellOrders[0];
      if (!bestSell || order.price < bestSell.price) break;

      let tradedQty = Math.min(order.qty, bestSell.qty);
      let tradePrice = bestSell.price;

      order.qty -= tradedQty;
      bestSell.qty -= tradedQty;

      await emitTrade(order, bestSell, tradedQty, tradePrice, this.symbol);

      if (bestSell.qty === 0) {
        this.sellOrders.shift();
      }
    }

    if (order.qty > 0) {
      this.buyOrders.push(order);
      this.sortBooks();
      await emitOrderbook(this.symbol, this.buyOrders, this.sellOrders);
    }
  }

  async matchSell(order: order) {
    while (order.qty > 0) {
      if (this.buyOrders.length === 0) break;

      let bestBuy = this.buyOrders[0];
      if (!bestBuy || order.price > bestBuy.price) break;

      let tradedQty = Math.min(order.qty, bestBuy.qty);
      let tradePrice = bestBuy.price;

      order.qty -= tradedQty;
      bestBuy.qty -= tradedQty;

      await emitTrade(bestBuy, order, tradedQty, tradePrice, this.symbol);

      if (bestBuy.qty === 0) {
        this.buyOrders.shift();
      }
    }

    if (order.qty > 0) {
      this.sellOrders.push(order);
      this.sortBooks();
      await emitOrderbook(this.symbol, this.buyOrders, this.sellOrders);
    }
  }
}