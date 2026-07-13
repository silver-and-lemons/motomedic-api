import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import type { MotorcycleQuestionnaire } from "../dto/generate-checklist.dto.js";

vi.mock("../../shared/middleware/auth.middleware.js", () => ({
  authenticate: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const validProfile: MotorcycleQuestionnaire = {
  bikeType: "automatic-scooter",
  engineSize: "100-125cc",
  fuelSystem: "fuel-injected",
  cooling: "air-cooled",
  bikeAge: "2020-present",
};

const fullProfile: MotorcycleQuestionnaire = {
  bikeType: "sport-naked-big-bike",
  engineSize: "156cc-above",
  fuelSystem: "fuel-injected",
  cooling: "liquid-cooled",
  bikeAge: "2014-and-older",
};

describe("POST /api/v1/checklist/generate", () => {
  it("returns 201 with generated checklist items for a valid profile", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/generate")
      .send(validProfile);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("profile");
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("generatedAt");

    expect(res.body.profile).toEqual(validProfile);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    for (const item of res.body.items) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("description");
      expect(item).toHaveProperty("category");
      expect(item).toHaveProperty("condition");
      expect(item).toHaveProperty("required");
      expect(item).toHaveProperty("status");
      expect(item.status).toBe("pending");
    }
  });

  it("returns 201 with full set of items for a maximal big-bike profile", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/generate")
      .send(fullProfile);

    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(12);
  });

  it("returns 400 when body is null", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/generate")
      .send(null);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 when body is a non-object (string)", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/generate")
      .send("invalid");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("accepts empty object and returns always-shown items with defaults", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/generate")
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.items.length).toBeGreaterThanOrEqual(5);
  });

  it("accepts invalid enum values (no runtime validation)", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/generate")
      .send({ bikeType: "tricycle", engineSize: "500cc" });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("accepts wrong field types (no runtime validation)", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/generate")
      .send({ bikeType: 123, engineSize: null, fuelSystem: true });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});

describe("POST /api/v1/checklist/evaluate", () => {
  it("returns 200 with evaluated items for valid input", async () => {
    const generateRes = await request(app)
      .post("/api/v1/checklist/generate")
      .send(validProfile);

    const input = {
      profile: validProfile,
      items: generateRes.body.items,
    };

    const res = await request(app)
      .post("/api/v1/checklist/evaluate")
      .send(input);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("profile");
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("evaluatedAt");

    expect(res.body.profile).toEqual(validProfile);
    expect(res.body.items).toEqual(generateRes.body.items);
    expect(res.body.evaluatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns 200 with items array preserved even when empty", async () => {
    const input = {
      profile: validProfile,
      items: [],
    };

    const res = await request(app)
      .post("/api/v1/checklist/evaluate")
      .send(input);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it("returns 400 when body is null", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/evaluate")
      .send(null);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 when body is a non-object (string)", async () => {
    const res = await request(app)
      .post("/api/v1/checklist/evaluate")
      .send("not-an-object");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});
