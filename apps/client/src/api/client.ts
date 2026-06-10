import { API_URL } from "@/lib/config";
import type {
  Market,
  Order,
  Portfolio,
  Position,
  TradeHistory,
  User,
} from "./types";

function getToken() {
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      typeof data.error === "string"
        ? data.error
        : data.error?.message || "Request failed";
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  login(email: string, password: string) {
    return request<{ token: string; user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(username: string, email: string, password: string) {
    return request<{ token: string; user: User }>("/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  getMarkets() {
    return request<{ markets: Market[] }>("/market");
  },

  getOrders(symbol?: string, openOnly = false) {
    const params = new URLSearchParams();
    if (symbol) params.set("symbol", symbol);
    if (openOnly) params.set("open", "true");
    const query = params.toString();
    return request<{ orders: Order[] }>(`/orders${query ? `?${query}` : ""}`);
  },

  getOrder(orderId: string) {
    return request<{ order: Order }>(`/orders/${orderId}`);
  },

  placeOrder(body: {
    symbol: string;
    side: "buy" | "sell";
    type: "limit" | "market";
    qty: number;
    price?: number;
  }) {
    return request<{ message: string; orderId: string; symbol: string }>("/order", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getPositions() {
    return request<{ positions: Position[] }>("/positions");
  },

  getPositionBySymbol(symbol: string) {
    return request<{ positions: Position[] }>(`/positions/${symbol}`);
  },

  getPortfolio() {
    return request<Portfolio>("/portfolio");
  },

  getHistory() {
    return request<{ history: TradeHistory[] }>("/history");
  },

  cancelOrder(orderId: string) {
    return request<{ message: string; orderId: string }>(
      `/orders/${orderId}/cancel`,
      { method: "POST" }
    );
  },

  exitPosition(symbol: string, positionId?: string) {
    return request<{
      message: string;
      orderId: string;
      side: string;
      qty: number;
      symbol: string;
    }>(`/positions/${symbol}/exit`, {
      method: "POST",
      body: JSON.stringify(positionId ? { positionId } : {}),
    });
  },
};
