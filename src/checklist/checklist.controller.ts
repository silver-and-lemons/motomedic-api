import type { Request, Response, NextFunction } from "express";

export function generate(req: Request, res: Response, next: NextFunction): void {
  next();
}

export function evaluate(req: Request, res: Response, next: NextFunction): void {
  next();
}
