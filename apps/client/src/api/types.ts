export type User = {
  id: string;
  email: string;
  username: string;
};

export type Market = {
  id: string;
  symbol: string;
};

export type Order = {
  orderId: string;
  userId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  qty: number;
  filledQty?: number;
  remainingQty?: number;
  price: number;
  status: string;
  timestamp: number;
};

export type Position = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  marketId?: string;
  value?: number;
  markPrice?: number;
  marketValue?: number;
  unrealizedPnl?: number;
  unrealizedPnlPct?: number;
};

export type TradeHistory = {
  id: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  exitPrice: number;
  pnl: number;
};

export type Portfolio = {
  balance: number;
  positions: Position[];
  totalPositionValue: number;
  totalUnrealizedPnl?: number;
  totalPortfolioValue: number;
};

export type OrderBookLevel = {
  orderId?: string;
  userId?: string;
  price: number;
  qty: number;
  side?: string;
};

export type OrderBookSnapshot = {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
};

export type LiveTrade = {
  symbol: string;
  tradeId: string;
  price: number;
  quantity: number;
  timestamp: number;
};
