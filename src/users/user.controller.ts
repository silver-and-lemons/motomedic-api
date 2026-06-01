import type { Request, Response } from "express";

export function list(_req: Request, res: Response) {
  res.json([]);
}

export function getById(req: Request, res: Response) {
  res.json({ id: req.params.id });
}

export function create(req: Request, res: Response) {
  res.status(201).json(req.body);
}
