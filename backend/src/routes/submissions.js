import express from "express";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload, fileUrl } from "../middleware/upload.js";
import { logRequest } from "../logger.js";
import { ensureQuizSchema } from "../ensureSchema.js";

const router = express.Router();
router.use(requireAuth);
router.use(async (req, res, next) => {
  try {
    await ensureQuizSchema();
    next();
  } catch (error) {
    next(error);
  }
});

router.get("/my", async (req, res) => {
  const submissions = await query(`
    SELECT s.id, s.question_id AS questionId, s.answer_text AS answerText, s.image_path AS imagePath,
           s.score, s.feedback, s.status, s.updated_at AS updatedAt, q.title, z.title AS quizTitle
    FROM submissions s
    JOIN questions q ON q.id = s.question_id
    LEFT JOIN quizzes z ON z.id = q.quiz_id
    WHERE s.user_id = :userId
    ORDER BY s.updated_at DESC
  `, { userId: req.user.id });
  res.json({ submissions });
});

router.post("/", upload.single("image"), async (req, res) => {
  const questionId = Number(req.body.questionId);
  const answerText = String(req.body.answerText || "").trim();
  if (!questionId) return res.status(400).json({ message: "缺少题目 ID" });
  if (!answerText && !req.file) return res.status(400).json({ message: "请提交文本答案或图片" });

  await query(`
    INSERT INTO submissions (question_id, user_id, answer_text, image_path, status, score, feedback)
    VALUES (:questionId, :userId, :answerText, :imagePath, 'submitted', NULL, NULL)
    ON DUPLICATE KEY UPDATE
      answer_text = VALUES(answer_text),
      image_path = COALESCE(VALUES(image_path), image_path),
      status = 'submitted',
      score = NULL,
      feedback = NULL,
      updated_at = CURRENT_TIMESTAMP
  `, {
    questionId,
    userId: req.user.id,
    answerText,
    imagePath: fileUrl(req.file)
  });
  logRequest("User", "submit-answer", req, { questionId, hasImage: Boolean(req.file), answerLength: answerText.length });
  res.status(201).json({ ok: true });
});

router.get("/", requireAdmin, async (req, res) => {
  const submissions = await query(`
    SELECT s.id, s.question_id AS questionId, s.user_id AS userId, s.answer_text AS answerText,
           s.image_path AS imagePath, s.score, s.feedback, s.status, s.created_at AS createdAt,
           s.updated_at AS updatedAt, q.title, z.title AS quizTitle, u.username, u.display_name AS displayName
    FROM submissions s
    JOIN questions q ON q.id = s.question_id
    LEFT JOIN quizzes z ON z.id = q.quiz_id
    JOIN users u ON u.id = s.user_id
    ORDER BY s.updated_at DESC
  `);
  res.json({ submissions });
});

router.patch("/:id/grade", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const score = req.body.score === "" || req.body.score == null ? null : Number(req.body.score);
  const feedback = String(req.body.feedback || "").trim();
  if (score != null && (Number.isNaN(score) || score < 0 || score > 100)) {
    return res.status(400).json({ message: "分数必须在 0 到 100 之间" });
  }
  await query(
    "UPDATE submissions SET score = :score, feedback = :feedback, status = 'graded' WHERE id = :id",
    { id, score, feedback }
  );
  logRequest("Admin", "grade-submission", req, { submissionId: id, score, feedbackLength: feedback.length });
  res.json({ ok: true });
});

export default router;
