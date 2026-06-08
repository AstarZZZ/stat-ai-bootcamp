import express from "express";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload, fileUrl } from "../middleware/upload.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const questions = await query(`
    SELECT q.id, q.title, q.content, q.answer, q.image_path AS imagePath, q.created_at AS createdAt,
           u.display_name AS createdBy
    FROM questions q
    LEFT JOIN users u ON u.id = q.created_by
    ORDER BY q.created_at DESC
  `);
  res.json({ questions });
});

router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  const title = String(req.body.title || "").trim();
  const content = String(req.body.content || "").trim();
  const answer = String(req.body.answer || "").trim();
  if (!title || !content) return res.status(400).json({ message: "题目标题和内容必填" });

  const result = await query(
    "INSERT INTO questions (title, content, answer, image_path, created_by) VALUES (:title, :content, :answer, :imagePath, :createdBy)",
    { title, content, answer, imagePath: fileUrl(req.file), createdBy: req.user.id }
  );
  res.status(201).json({ id: result.insertId });
});

router.put("/:id", requireAdmin, upload.single("image"), async (req, res) => {
  const id = Number(req.params.id);
  const title = String(req.body.title || "").trim();
  const content = String(req.body.content || "").trim();
  const answer = String(req.body.answer || "").trim();
  if (!title || !content) return res.status(400).json({ message: "题目标题和内容必填" });

  if (req.file) {
    await query(
      "UPDATE questions SET title = :title, content = :content, answer = :answer, image_path = :imagePath WHERE id = :id",
      { id, title, content, answer, imagePath: fileUrl(req.file) }
    );
  } else {
    await query(
      "UPDATE questions SET title = :title, content = :content, answer = :answer WHERE id = :id",
      { id, title, content, answer }
    );
  }
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM questions WHERE id = :id", { id: Number(req.params.id) });
  res.json({ ok: true });
});

export default router;
