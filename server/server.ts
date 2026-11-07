import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

const { MONGO_URI, JWT_SECRET, CLIENT_ORIGIN = "http://localhost:5173" } = process.env;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI || !JWT_SECRET) {
  console.error("Missing MONGO_URI or JWT_SECRET. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN.split(",") }));
app.use(express.json({ limit: "10kb" }));

// Basic brute-force protection on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler
app.use((err:unknown, _req:Request, res:Response, _next:NextFunction) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: Object.values(err.errors)[0].message });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: "Invalid id" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
