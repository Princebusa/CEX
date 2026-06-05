import { z } from "zod";

export const orderSchema = z
  .object({
    side: z.enum(["buy", "sell"]),
    type: z.enum(["market", "limit"]),
    qty: z.number().positive(),
    price: z.number().positive().optional(),
    symbol: z.string().min(1),
  })
  .refine((data) => data.type === "market" || data.price !== undefined, {
    message: "Price is required for limit orders",
    path: ["price"],
  });