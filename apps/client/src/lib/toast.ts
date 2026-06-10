import { toast } from "sonner";

type OrderUpdate = {
  orderId: string;
  symbol: string;
  status: string;
  filledQty: number;
  qty: number;
};

const recentToasts = new Map<string, number>();
const TOAST_DEDUPE_MS = 3000;

function shouldToastUpdate(update: OrderUpdate) {
  const key = `${update.orderId}:${update.status}:${update.filledQty}`;
  const now = Date.now();
  const last = recentToasts.get(key);
  if (last && now - last < TOAST_DEDUPE_MS) return false;
  recentToasts.set(key, now);
  return true;
}

export function toastOrderPlaced(symbol: string, side: string, orderId: string) {
  toast.success("Order placed", {
    description: `${side.toUpperCase()} ${symbol} · ${orderId.slice(0, 8)}…`,
  });
}

export function toastOrderUpdate(update: OrderUpdate) {
  if (!shouldToastUpdate(update)) return;

  const remaining = update.qty - update.filledQty;

  switch (update.status) {
    case "open":
      toast.info("Order open on book", {
        description: `${update.symbol} · waiting to fill`,
      });
      break;
    case "partially_filled":
      toast.info("Order partially filled", {
        description: `${update.symbol} · ${update.filledQty}/${update.qty} filled · ${remaining} remaining`,
      });
      break;
    case "filled":
      toast.success("Order filled", {
        description: `${update.symbol} · ${update.qty} @ filled`,
      });
      break;
    case "cancelled":
      toast(
        update.filledQty > 0 ? "Unfilled portion cancelled" : "Market order cancelled",
        {
          description:
            update.filledQty > 0
              ? `${update.symbol} · ${update.filledQty}/${update.qty} filled · rest cancelled`
              : `${update.symbol} · no matching liquidity on book`,
        }
      );
      break;
  }
}

export function toastExitPlaced(symbol: string, side: string, qty: number) {
  toast.success("Exit order placed", {
    description: `${side.toUpperCase()} ${qty} ${symbol} at market`,
  });
}

export function toastError(message: string) {
  toast.error(message);
}
