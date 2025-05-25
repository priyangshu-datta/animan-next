import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

/**
 * Issue access token
 * @param {string} userId subject
 * @returns {Promise<string>}
 */
export function issueAccessToken(userId) {
  return new SignJWT()
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer("animan")
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + 60 * 15 * 1000))
    .sign(new TextEncoder().encode(JWT_SECRET));
}

/**
 * Issue refresh token
 * @returns {string}
 */
export function issueRefreshToken() {
  return crypto.randomBytes(64).toString("hex"); // Store hashed in DB
}

/**
 * Validate access token
 * @param {string} token
 * @returns { Promise<{valid: true; payload: import("jose").JWTVerifyResult<import("jose").JWTPayload>} | {valid: false; error: string}>  }
 */
export async function validateAccessToken(token) {
  try {
    const decoded = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      {
        algorithms: ["HS256"], // You can change the algorithm if you're using another (e.g., RS256)
        issuer: "animan", // Verify issuer if provided
        maxTokenAge: "15m",
        clockTolerance: "1m",
      }
    );
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
