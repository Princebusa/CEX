import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { cn } from "@/lib/utils";

type Props = {
  symbol: string;
  onOrderPlaced: () => void;
};

export function OrderPanel({ symbol, onOrderPlaced }: Props) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"limit" | "market">("limit");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body: {
        symbol: string;
        side: "buy" | "sell";
        type: "limit" | "market";
        qty: number;
        price?: number;
      } = {
        symbol,
        side,
        type,
        qty: Number(qty),
      };

      if (type === "limit") {
        body.price = Number(price);
      }

      const res = await api.placeOrder(body);
      setSuccess(`Order placed: ${res.orderId.slice(0, 8)}...`);
      onOrderPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold">Place Order</h3>
        <p className="text-xs text-muted-foreground">{symbol}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={side === "buy" ? "default" : "outline"}
            className={cn(side === "buy" && "bg-emerald-600 hover:bg-emerald-600/90")}
            onClick={() => setSide("buy")}
          >
            Buy
          </Button>
          <Button
            type="button"
            variant={side === "sell" ? "default" : "outline"}
            className={cn(side === "sell" && "bg-red-600 hover:bg-red-600/90")}
            onClick={() => setSide("sell")}
          >
            Sell
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant={type === "limit" ? "secondary" : "ghost"}
            onClick={() => setType("limit")}
          >
            Limit
          </Button>
          <Button
            type="button"
            size="sm"
            variant={type === "market" ? "secondary" : "ghost"}
            onClick={() => setType("market")}
          >
            Market
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qty">Quantity</Label>
          <Input
            id="qty"
            type="number"
            min="1"
            step="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </div>

        {type === "limit" && (
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-emerald-500">{success}</p>}

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "mt-auto w-full",
            side === "buy" ? "bg-emerald-600 hover:bg-emerald-600/90" : "bg-red-600 hover:bg-red-600/90"
          )}
        >
          {loading ? "Placing..." : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
        </Button>
      </form>
    </div>
  );
}
