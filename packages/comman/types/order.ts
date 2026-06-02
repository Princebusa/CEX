import {z} from "zod"

export const orderSchema = z.object({
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit"]),
  qty: z.number().positive(),
  price: z.number().positive(),
  symbol: z.string().min(1),
});