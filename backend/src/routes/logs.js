import express from "express";
import { pool, query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { listLogFiles, readLogEntries } from "../logger.js";

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 300, 1), 1000);
  const type = String(req.query.type || "").trim();
  const file = String(req.query.file || "").trim();
  const [files, entries] = await Promise.all([
    listLogFiles(),
    readLogEntries({ file, type, limit })
  ]);
  res.json({ files, entries });
});

router.get("/database", async (req, res) => {
  const [[database], tables, [questions], [submissions], [users]] = await Promise.all([
    query("SELECT DATABASE() AS name"),
    query(`
      SELECT table_name AS tableName, table_rows AS tableRows, data_length AS dataLength, index_length AS indexLength
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    `),
    query("SELECT COUNT(*) AS total FROM questions"),
    query("SELECT COUNT(*) AS total FROM submissions"),
    query("SELECT COUNT(*) AS total FROM users")
  ]);

  const poolState = {
    connectionLimit: pool.pool?.config?.connectionLimit || null,
    queueLimit: pool.pool?.config?.queueLimit || null
  };

  res.json({
    database: database?.name || "",
    counts: {
      questions: questions?.total || 0,
      submissions: submissions?.total || 0,
      users: users?.total || 0
    },
    pool: poolState,
    tables
  });
});

export default router;
