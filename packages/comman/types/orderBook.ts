export type order = {
  orderId: string;
  userId: string;
  symbol: string;
  type: "limit" | "market";
  qty: number;
  originalQty?: number;
  filledQty?: number;
  side: "buy" | "sell";
  price: number;
  timestamp: number;
};


