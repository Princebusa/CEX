import type { Request, Response } from "express";

export function buycontroller(req: Request, res: Response) {
  const userId = (req as any).userId;

  return res.status(200).json({
    message: "Buy order placed successfully",
    userId,
  });
}


export function sellcontroller(req: Request, res: Response) {
  const userId = (req as any).userId;

  return res.status(200).json({
    message: "Sell order placed successfully",
    userId,
  });
}
