

export type order = {
    orderId: string;
    userId: string;
    type: "limit" | "market";
    qty: number;
    side : "BUY" | "SELL";
    price: number;
    timestamp: number;
}


