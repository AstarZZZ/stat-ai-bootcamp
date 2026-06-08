import express from "express";
import multer from "multer";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload, fileUrl } from "../middleware/upload.js";

const router = express.Router();

const jsonUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const isJsonMime = ["application/json", "text/json", "application/octet-stream"].includes(file.mimetype);
    const isJsonName = file.originalname.toLowerCase().endsWith(".json");
    if (!isJsonMime && !isJsonName) return cb(new Error("仅支持 JSON 文件"));
    cb(null, true);
  }
});

function firstText(item, keys) {
  for (const key of keys) {
    if (typeof item[key] === "string" && item[key].trim()) return item[key].trim();
    if (typeof item[key] === "number") return String(item[key]).trim();
  }
  return "";
}

function normalizeQuestion(item, index) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error(`第 ${index + 1} 条题目必须是对象`);
  }

  const title = firstText(item, ["title", "name", "questionTitle", "题目标题", "标题"]);
  const content = firstText(item, ["content", "question", "stem", "body", "题目内容", "题干", "问题"]);
  const answer = firstText(item, ["answer", "referenceAnswer", "solution", "参考答案", "答案", "解析"]);
  const imagePath = firstText(item, ["imagePath", "imageUrl", "image", "图片", "图片地址"]);

  if (!title || !content) {
    throw new Error(`第 ${index + 1} 条题目缺少 title/content`);
  }

  return { title, content, answer, imagePath: imagePath || null };
}

function parseQuestionImport(buffer) {
  let payload;
  try {
    payload = JSON.parse(buffer.toString("utf8"));
  } catch {
    throw new Error("JSON 文件格式不正确，无法解析");
  }

  const items = Array.isArray(payload) ? payload : payload?.questions;
  if (!Array.isArray(items)) {
    throw new Error("JSON 根节点必须是题目数组，或包含 questions 数组的对象");
  }
  if (!items.length) throw new Error("JSON 中没有题目");
  if (items.length > 200) throw new Error("单次最多导入 200 道题");

  return items.map(normalizeQuestion);
}

router.post("/import-json", requireAuth, requireAdmin, jsonUpload.single("json"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "请上传 JSON 文件" });

  const questions = parseQuestionImport(req.file.buffer);
  const ids = [];
  for (const question of questions) {
    const result = await query(
      "INSERT INTO questions (title, content, answer, image_path, created_by) VALUES (:title, :content, :answer, :imagePath, :createdBy)",
      { ...question, createdBy: req.user.id }
    );
    ids.push(result.insertId);
  }

  res.status(201).json({ imported: ids.length, ids });
});

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
