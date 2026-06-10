import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { cn } from "@/lib/utils";
import { toastError, toastOrderPlaced } from "@/lib/toast";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      toastOrderPlaced(symbol, side, res.orderId);
      onOrderPlaced();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-semibold text-foreground">Place Order</h3>
        <p className="text-xs text-muted-foreground">{symbol}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 p-5">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-1">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-9 shadow-none",
              side === "buy" && "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200"
            )}
            onClick={() => setSide("buy")}
          >
            Buy
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-9 shadow-none",
              side === "sell" && "bg-white text-red-700 shadow-sm ring-1 ring-red-200"
            )}
            onClick={() => setSide("sell")}
          >
            Sell
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={cn(
              "shadow-none",
              type === "limit" && "bg-white shadow-sm ring-1 ring-border"
            )}
            onClick={() => setType("limit")}
          >
            Limit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={cn(
              "shadow-none",
              type === "market" && "bg-white shadow-sm ring-1 ring-border"
            )}
            onClick={() => setType("market")}
          >
            Market
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qty" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quantity
          </Label>
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
            <Label htmlFor="price" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Price
            </Label>
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

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "mt-auto h-10 w-full font-semibold",
            side === "buy"
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-red-600 text-white hover:bg-red-700"
          )}
        >
          {loading ? "Placing..." : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
        </Button>
      </form>
    </div>
  );
}
