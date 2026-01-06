import { Request, Response } from "express";
import { prisma } from "../config/db";
import * as bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";

interface registerRequestBody {
  username: string;
  email: string;
  password: string;
}

interface loginRequestBody {
  username: string;
  password: string;
}

export const register = async (
  req: Request<{}, {}, registerRequestBody>,
  res: Response
) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      const field = existingUser.username === username ? "Username" : "Email";
      return res.status(400).json({ error: `${field} already taken` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    const token = generateToken(user.id, res);

    return res.status(201).json({
      status: "success",
      data: {
        user: { id: user.id, username, email },
        token,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (
  req: Request<{}, {}, loginRequestBody>,
  res: Response
) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({ where: { username } });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user.id, res);

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: username,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
