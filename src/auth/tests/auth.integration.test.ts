import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";

vi.mock("../../shared/config/database.js", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    returning: vi.fn().mockResolvedValue([{ id: "test-user-id" }]),
  },
}));

vi.mock("../../shared/utils/logger.js", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
  jwtVerify: vi.fn().mockRejectedValue(new Error("Invalid token")),
}));

describe("Auth Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should return 400 if body is empty", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("required");
    });

    it("should return 400 if phone is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "test@example.com", fullName: "Test User" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/verify-otp", () => {
    it("should return 400 if body is empty", async () => {
      const res = await request(app).post("/api/v1/auth/verify-otp").send({});
      expect(res.status).toBe(400);
    });

    it("should return 400 if otp is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/verify-otp")
        .send({ userId: "test-user-id" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return 400 if phone is missing", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("required");
    });
  });

  describe("POST /api/v1/auth/verify-login", () => {
    it("should return 400 if body is empty", async () => {
      const res = await request(app).post("/api/v1/auth/verify-login").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should return 400 if refreshToken is missing", async () => {
      const res = await request(app).post("/api/v1/auth/refresh").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("required");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should return 400 if refreshToken is missing", async () => {
      const res = await request(app).post("/api/v1/auth/logout").send({});
      expect(res.status).toBe(400);
    });
  });
});
