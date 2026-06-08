import mysql from "mysql2/promise";
import { logEvent } from "./logger.js";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "stat_ai_bootcamp",
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

export async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  const normalized = String(sql).replace(/\s+/g, " ").trim();
  const verb = normalized.split(" ")[0]?.toUpperCase();
  if (["INSERT", "UPDATE", "DELETE", "ALTER", "CREATE", "DROP"].includes(verb)) {
    logEvent("Database", "write-query", {
      operation: verb,
      sql: normalized.slice(0, 220),
      paramKeys: Object.keys(params)
    });
  }
  return rows;
}
