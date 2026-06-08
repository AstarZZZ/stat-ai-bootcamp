import "dotenv/config";
import bcrypt from "bcryptjs";
import { query, pool } from "../src/db.js";

const username = process.env.ADMIN_USERNAME || "Admin";
const password = process.env.ADMIN_PASSWORD || "Admin";

const exists = await query("SELECT id FROM users WHERE username = :username LIMIT 1", { username });
const passwordHash = await bcrypt.hash(password, 10);

if (exists.length) {
  await query(
    "UPDATE users SET password_hash = :passwordHash, role = 'admin', is_active = 1, display_name = '管理员' WHERE username = :username",
    { username, passwordHash }
  );
  console.log("Admin account updated.");
} else {
  await query(
    "INSERT INTO users (username, password_hash, display_name, role) VALUES (:username, :passwordHash, '管理员', 'admin')",
    { username, passwordHash }
  );
  console.log("Admin account created.");
}

await pool.end();
