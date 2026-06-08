import jwt from "jsonwebtoken";
import { query } from "../db.js";

const jwtSecret = () => process.env.JWT_SECRET || "dev-only-change-me";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    jwtSecret(),
    { expiresIn: "7d" }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "未登录" });

    const payload = jwt.verify(token, jwtSecret());
    const users = await query(
      "SELECT id, username, display_name, role, is_active FROM users WHERE id = :id LIMIT 1",
      { id: payload.id }
    );
    const user = users[0];
    if (!user || !user.is_active) return res.status(401).json({ message: "账户不可用" });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "登录已失效" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "需要管理员权限" });
  next();
}
