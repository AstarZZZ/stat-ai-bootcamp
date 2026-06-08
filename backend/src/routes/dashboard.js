import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  if (req.user.role === "admin") {
    const [users] = await query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'");
    const [questions] = await query("SELECT COUNT(*) AS total FROM questions");
    const [submitted] = await query("SELECT COUNT(*) AS total FROM submissions WHERE status = 'submitted'");
    const [graded] = await query("SELECT COUNT(*) AS total FROM submissions WHERE status = 'graded'");
    const recent = await query(`
      SELECT s.id, s.score, s.status, s.updated_at AS updatedAt, q.title, u.display_name AS displayName
      FROM submissions s
      JOIN questions q ON q.id = s.question_id
      JOIN users u ON u.id = s.user_id
      ORDER BY s.updated_at DESC
      LIMIT 8
    `);
    return res.json({
      role: "admin",
      cards: {
        students: users.total,
        questions: questions.total,
        pending: submitted.total,
        graded: graded.total
      },
      recent
    });
  }

  const [weekDone] = await query(
    "SELECT COUNT(*) AS total FROM week_progress WHERE user_id = :userId AND completed = 1",
    { userId: req.user.id }
  );
  const [leetcodeDone] = await query(
    "SELECT COUNT(*) AS total FROM leetcode_progress WHERE user_id = :userId AND completed = 1",
    { userId: req.user.id }
  );
  const [graded] = await query(
    "SELECT COUNT(*) AS total, AVG(score) AS averageScore FROM submissions WHERE user_id = :userId AND status = 'graded'",
    { userId: req.user.id }
  );
  const totalUnits = 8 + 32;
  const doneUnits = Number(weekDone.total) + Number(leetcodeDone.total);
  res.json({
    role: "student",
    cards: {
      weekDone: weekDone.total,
      leetcodeDone: leetcodeDone.total,
      graded: graded.total,
      averageScore: graded.averageScore ? Number(graded.averageScore).toFixed(1) : "-"
    },
    percent: Math.round((doneUnits / totalUnits) * 100)
  });
});

export default router;
