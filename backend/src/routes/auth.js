import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = express.Router();

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role
  };
}

router.post("/register", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  const displayName = String(req.body.displayName || username).trim();
  if (!username || username.length < 3) return res.status(400).json({ message: "用户名至少 3 个字符" });
  if (!password || password.length < 6) return res.status(400).json({ message: "密码至少 6 个字符" });

  const exists = await query("SELECT id FROM users WHERE username = :username LIMIT 1", { username });
  if (exists.length) return res.status(409).json({ message: "用户名已存在" });

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    "INSERT INTO users (username, password_hash, display_name, role) VALUES (:username, :passwordHash, :displayName, 'student')",
    { username, passwordHash, displayName }
  );
  const users = await query("SELECT id, username, display_name, role FROM users WHERE id = :id", { id: result.insertId });
  const user = users[0];
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  const users = await query(
    "SELECT id, username, password_hash, display_name, role, is_active FROM users WHERE username = :username LIMIT 1",
    { username }
  );
  const user = users[0];
  if (!user || !user.is_active) return res.status(401).json({ message: "用户名或密码错误" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "用户名或密码错误" });
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
