import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { Types } from "mongoose";
import User from "../models/User.js";
import auth from "../middleware/auth.js";


const router = Router();

const signToken = (id: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  return jwt.sign({ id: String(id) }, secret, { expiresIn });
};

const publicUser = (u: { _id: Types.ObjectId; name: string; email: string }) => ({
  id: u._id,
  name: u.name,
  email: u.email,
});

interface AuthBody {
  name?: string;
  email?: string;
  password?: string;
}

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as AuthBody;
  if (!name || !email || !password) {
  res.status(400).json({ error: "Name, email and password are required" });
  return;
}
  if (await User.exists({ email: String(email).toLowerCase() })) {
    res.status(409).json({ error: "Email is already registered" });
    return;
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as AuthBody;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(String(password)))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  res.json({ token: signToken(user._id), user: publicUser(user) });
});

router.get("/me", auth, (req: Request, res: Response): void => {
  res.json({ user: publicUser(req.user) });
});

export default router;