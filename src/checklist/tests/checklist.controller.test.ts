import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import * as checklistService from "../checklist.service.js";

vi.mock("../checklist.service.js", () => ({
  generate: vi.fn(),
  evaluate: vi.fn(),
}));

const { generate, evaluate } = await import("../checklist.controller.js");

beforeEach(() => {
  vi.clearAllMocks();
});

function mockReqRes(body: unknown) {
  const req = { body } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

const validProfile = {
  bikeType: "automatic-scooter" as const,
  engineSize: "100-125cc" as const,
  fuelSystem: "fuel-injected" as const,
  cooling: "air-cooled" as const,
  bikeAge: "2020-present" as const,
};

describe("generate handler", () => {
  it("returns 201 with checklist on valid body", () => {
    const fakeResult = { profile: validProfile, items: [], generatedAt: new Date().toISOString() };
    vi.mocked(checklistService.generate).mockReturnValue(fakeResult);

    const { req, res, next } = mockReqRes(validProfile);
    generate(req, res, next);

    expect(checklistService.generate).toHaveBeenCalledWith(validProfile);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when body is null", () => {
    const { req, res, next } = mockReqRes(null);
    generate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or missing profile" });
    expect(checklistService.generate).not.toHaveBeenCalled();
  });

  it("calls next with error when service throws", () => {
    const error = new Error("db down");
    vi.mocked(checklistService.generate).mockImplementation(() => { throw error; });

    const { req, res, next } = mockReqRes(validProfile);
    generate(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("evaluate handler", () => {
  const validInput = { profile: validProfile, items: [] };

  it("returns 200 with evaluated items on valid body", () => {
    const fakeResult = { profile: validProfile, items: [], evaluatedAt: new Date().toISOString() };
    vi.mocked(checklistService.evaluate).mockReturnValue(fakeResult);

    const { req, res, next } = mockReqRes(validInput);
    evaluate(req, res, next);

    expect(checklistService.evaluate).toHaveBeenCalledWith(validInput);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when body is null", () => {
    const { req, res, next } = mockReqRes(null);
    evaluate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or missing input" });
    expect(checklistService.evaluate).not.toHaveBeenCalled();
  });

  it("calls next with error when service throws", () => {
    const error = new Error("timeout");
    vi.mocked(checklistService.evaluate).mockImplementation(() => { throw error; });

    const { req, res, next } = mockReqRes(validInput);
    evaluate(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
