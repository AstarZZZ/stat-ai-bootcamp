import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/", async (req, res) => {
  const users = await query(`
    SELECT id, username, display_name AS displayName, role, is_active AS isActive, created_at AS createdAt
    FROM users
    ORDER BY created_at DESC
  `);
  res.json({ users });
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const role = req.body.role === "admin" ? "admin" : "student";
  const isActive = req.body.isActive ? 1 : 0;
  const displayName = String(req.body.displayName || "").trim();
  await query(
    "UPDATE users SET role = :role, is_active = :isActive, display_name = COALESCE(NULLIF(:displayName, ''), display_name) WHERE id = :id",
    { id, role, isActive, displayName }
  );
  res.json({ ok: true });
});

router.post("/:id/password", async (req, res) => {
  const id = Number(req.params.id);
  const password = String(req.body.password || "");
  if (password.length < 6) return res.status(400).json({ message: "密码至少 6 个字符" });
  const passwordHash = await bcrypt.hash(password, 10);
  await query("UPDATE users SET password_hash = :passwordHash WHERE id = :id", { id, passwordHash });
  res.json({ ok: true });
});

export default router;
