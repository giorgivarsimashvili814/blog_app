import jwt from "jsonwebtoken";
import "dotenv/config";
import { Response } from "express";

export const generateToken = (userId: number, res: Response) => {
  const secret = process.env["JWT_SECRET"];
  const expires = process.env["JWT_EXPIRES_IN"] || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ userId }, secret, {
    expiresIn: expires as any,
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return token;
};
