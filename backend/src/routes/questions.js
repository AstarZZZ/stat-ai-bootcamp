import express from "express";
import multer from "multer";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload, fileUrl } from "../middleware/upload.js";
import { logRequest } from "../logger.js";

const router = express.Router();

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
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

function parseJsonQuestions(text) {
  const payload = JSON.parse(text);
  const items = Array.isArray(payload) ? payload : payload?.questions;
  if (!Array.isArray(items)) {
    throw new Error("JSON 根节点必须是题目数组，或包含 questions 数组的对象");
  }
  if (!items.length) throw new Error("JSON 中没有题目");
  if (items.length > 200) throw new Error("单次最多导入 200 道题");

  return items.map(normalizeQuestion);
}

function cleanMarkdownTitle(line) {
  return line.replace(/^#{1,6}\s*/, "").trim();
}

function isQuestionStart(line) {
  const trimmed = line.trim();
  const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
  if (heading) {
    return heading[1] === "#" || /^第\s*\d+\s*题\s*[：:].*/u.test(heading[2]);
  }
  return /^第\s*\d+\s*题\s*[：:].*/u.test(trimmed);
}

function splitMarkdownSections(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (isQuestionStart(line)) {
      if (current) sections.push(current);
      current = { title: cleanMarkdownTitle(line), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }

  if (current) sections.push(current);
  if (sections.length) return sections;

  const nonEmptyIndex = lines.findIndex((line) => line.trim());
  if (nonEmptyIndex === -1) return [];
  return [{
    title: cleanMarkdownTitle(lines[nonEmptyIndex]),
    lines: lines.slice(nonEmptyIndex + 1)
  }];
}

function extractMarkdownQuestion(section, index) {
  const lines = [...section.lines];
  let imagePath = "";

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const match = lines[i].match(/^\s*(imagePath|imageUrl|图片地址|图片)\s*[:：]\s*(.+?)\s*$/i);
    if (match) {
      imagePath = match[2].trim();
      lines.splice(i, 1);
    }
  }

  let answerIndex = -1;
  let inlineAnswer = "";
  for (let i = 0; i < lines.length; i += 1) {
    const heading = lines[i].match(/^\s*#{1,6}\s*(参考答案|答案|解析)\s*[:：]?\s*$/u);
    const inline = lines[i].match(/^\s*(参考答案|答案|解析)\s*[:：]\s*(.*)$/u);
    if (heading || inline) {
      answerIndex = i;
      inlineAnswer = inline?.[2]?.trim() || "";
      break;
    }
  }

  const contentLines = answerIndex >= 0 ? lines.slice(0, answerIndex) : lines;
  const answerLines = answerIndex >= 0 ? [
    ...(inlineAnswer ? [inlineAnswer] : []),
    ...lines.slice(answerIndex + 1)
  ] : [];

  return normalizeQuestion({
    title: section.title,
    content: contentLines.join("\n").trim(),
    answer: answerLines.join("\n").trim(),
    imagePath
  }, index);
}

function parseMarkdownQuestions(text) {
  const sections = splitMarkdownSections(text);
  const questions = sections
    .map(extractMarkdownQuestion)
    .filter((question) => question.title && question.content);

  if (!questions.length) {
    throw new Error("Markdown/TXT 中没有可导入的题目");
  }
  if (questions.length > 200) throw new Error("单次最多导入 200 道题");

  return questions;
}

export function parseQuestionImport(buffer) {
  const text = buffer.toString("utf8").replace(/^\uFEFF/, "").trim();
  if (!text) throw new Error("文件内容为空，无法解析");

  const errors = [];
  try {
    return parseJsonQuestions(text);
  } catch (error) {
    errors.push(error.message);
  }

  try {
    return parseMarkdownQuestions(text);
  } catch (error) {
    errors.push(error.message);
  }

  throw new Error(`文件解析失败：${errors.join("；")}`);
}

router.post("/import-json", requireAuth, requireAdmin, importUpload.any(), async (req, res) => {
  const file = req.files?.[0];
  if (!file) return res.status(400).json({ message: "请上传 JSON、Markdown 或 TXT 文件" });

  const questions = parseQuestionImport(file.buffer);
  const ids = [];
  for (const question of questions) {
    const result = await query(
      "INSERT INTO questions (title, content, answer, image_path, created_by) VALUES (:title, :content, :answer, :imagePath, :createdBy)",
      { ...question, createdBy: req.user.id }
    );
    ids.push(result.insertId);
  }

  logRequest("Admin", "import-questions", req, {
    fileName: file.originalname,
    imported: ids.length,
    ids
  });
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
  logRequest("Admin", "create-question", req, { questionId: result.insertId, title });
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
  logRequest("Admin", "update-question", req, { questionId: id, title, imageUpdated: Boolean(req.file) });
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await query("DELETE FROM questions WHERE id = :id", { id });
  logRequest("Admin", "delete-question", req, { questionId: id });
  res.json({ ok: true });
});

export default router;
