import { createHash, randomInt } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../shared/config/database.js";
import { config } from "../shared/config/env.js";
import { users, otpTokens, refreshTokens, bikeOwned } from "../shared/infrastructure/database/schema.js";
import { logger } from "../shared/utils/logger.js";
import type { RegisterInput } from "./dto/register.dto.js";
import type { VerifyOtpInput } from "./dto/verify-otp.dto.js";
import type { LoginInput } from "./dto/login.dto.js";
import type { RefreshInput } from "./dto/refresh.dto.js";
import type { AuthTokens, AuthUser, OtpPurpose } from "./types/auth.types.js";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function generateOtpCode(): string {
  return randomInt(100000, 999999).toString();
}

function getExpiryDate(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

async function issueTokenPair(userId: string): Promise<AuthTokens> {
  const accessToken = await new SignJWT({ sub: userId, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwt.accessExpiresIn)
    .sign(new TextEncoder().encode(config.jwt.accessSecret));

  const refreshTokenId = crypto.randomUUID();
  const refreshToken = await new SignJWT({ sub: userId, type: "refresh", jti: refreshTokenId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwt.refreshExpiresIn)
    .sign(new TextEncoder().encode(config.jwt.refreshSecret));

  const refreshExpiresAt = getExpiryDate(7 * 24 * 60);

  await db.insert(refreshTokens).values({
    id: refreshTokenId,
    userId,
    token: refreshToken,
    expiresAt: refreshExpiresAt,
  });

  return { accessToken, refreshToken };
}

export async function registerUser(input: RegisterInput): Promise<{ userId: string; message: string }> {
  const existingPhone = input.phone
    ? await db.select().from(users).where(eq(users.contactNumber, input.phone)).limit(1)
    : [];
  if (existingPhone.length > 0) {
    throw new AppError("PHONE_EXISTS", "Phone number already registered", 409);
  }

  const existingEmail = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existingEmail.length > 0) {
    throw new AppError("EMAIL_EXISTS", "Email already registered", 409);
  }

  const [user] = await db
    .insert(users)
    .values({
      contactNumber: input.phone,
      email: input.email,
      fullName: input.fullName,
    })
    .returning({ id: users.id });

  await sendOtp(user.id, "register");

  return { userId: user.id, message: "OTP sent to your phone number" };
}

export async function loginUser(input: LoginInput): Promise<{ userId: string; message: string }> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.contactNumber, input.phone))
    .limit(1);

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "No account found with this phone number", 404);
  }

  await sendOtp(user.id, "login");

  return { userId: user.id, message: "OTP sent to your phone number" };
}

async function sendOtp(userId: string, purpose: OtpPurpose): Promise<void> {
  await db
    .delete(otpTokens)
    .where(and(eq(otpTokens.userId, userId), eq(otpTokens.purpose, purpose), eq(otpTokens.verified, false)));

  const otpCode = generateOtpCode();
  const hashedOtp = hashOtp(otpCode);
  const expiresAt = getExpiryDate(config.otp.expiryMinutes);

  await db.insert(otpTokens).values({
    userId,
    otpCode: hashedOtp,
    purpose,
    expiresAt,
  });

  logger.info(`[OTP] ${purpose} OTP for user ${userId}: ${otpCode}`);
}

export async function verifyOtp(input: VerifyOtpInput): Promise<AuthTokens & { user: AuthUser; hasBikeProfile: boolean }> {
  return verifyOtpForPurpose(input, "register");
}

export async function verifyLoginOtp(input: VerifyOtpInput): Promise<AuthTokens & { user: AuthUser; hasBikeProfile: boolean }> {
  return verifyOtpForPurpose(input, "login");
}

async function verifyOtpForPurpose(
  input: VerifyOtpInput,
  purpose: OtpPurpose,
): Promise<AuthTokens & { user: AuthUser; hasBikeProfile: boolean }> {
  const hashedInput = hashOtp(input.otp);

  const [token] = await db
    .select()
    .from(otpTokens)
    .where(
      and(
        eq(otpTokens.userId, input.userId),
        eq(otpTokens.purpose, purpose),
        eq(otpTokens.verified, false),
        gt(otpTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!token) {
    throw new AppError("INVALID_OTP", "Invalid or expired OTP", 401);
  }

  if (token.otpCode !== hashedInput) {
    throw new AppError("INVALID_OTP", "Incorrect OTP code", 401);
  }

  await db.update(otpTokens).set({ verified: true }).where(eq(otpTokens.id, token.id));

  const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found", 404);
  }

  const [bikeProfile] = await db
    .select()
    .from(bikeOwned)
    .where(eq(bikeOwned.userId, user.id))
    .limit(1);

  const tokens = await issueTokenPair(user.id);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      contactNumber: user.contactNumber,
    },
    hasBikeProfile: !!bikeProfile,
  };
}

export async function refreshTokensHandler(input: RefreshInput): Promise<AuthTokens> {
  let payload;
  try {
    const result = await jwtVerify(
      input.refreshToken,
      new TextEncoder().encode(config.jwt.refreshSecret),
    );
    payload = result.payload;
  } catch {
    throw new AppError("INVALID_TOKEN", "Invalid or expired refresh token", 401);
  }

  if (payload.type !== "refresh" || !payload.jti) {
    throw new AppError("INVALID_TOKEN", "Invalid token type", 401);
  }

  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.id, payload.jti), gt(refreshTokens.expiresAt, new Date())))
    .limit(1);

  if (!storedToken) {
    throw new AppError("INVALID_TOKEN", "Refresh token not found or expired", 401);
  }

  await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));

  return issueTokenPair(payload.sub as string);
}

export async function logoutHandler(input: RefreshInput): Promise<void> {
  let payload;
  try {
    const result = await jwtVerify(
      input.refreshToken,
      new TextEncoder().encode(config.jwt.refreshSecret),
    );
    payload = result.payload;
  } catch {
    return;
  }

  if (payload.jti) {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, payload.jti));
  }
}

export async function checkBikeProfile(userId: string): Promise<boolean> {
  const [bikeProfile] = await db
    .select()
    .from(bikeOwned)
    .where(eq(bikeOwned.userId, userId))
    .limit(1);

  return !!bikeProfile;
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}
