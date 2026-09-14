import jwt from "jsonwebtoken";

export const createAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
  if (!secret) throw new Error("JWT_SECRET is required");
  return jwt.sign(payload, secret, { expiresIn });
};

export const createRefreshToken = (payload) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET is required");
  return jwt.sign(payload, secret, { expiresIn });
};
