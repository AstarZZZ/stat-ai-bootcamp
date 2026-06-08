import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const weeks = await query(
    "SELECT week_number AS weekNumber, completed, notes FROM week_progress WHERE user_id = :userId",
    { userId: req.user.id }
  );
  const leetcode = await query(
    "SELECT week_number AS weekNumber, problem_index AS problemIndex, completed, note FROM leetcode_progress WHERE user_id = :userId",
    { userId: req.user.id }
  );
  res.json({ weeks, leetcode });
});

router.put("/week/:weekNumber", async (req, res) => {
  const weekNumber = Number(req.params.weekNumber);
  const completed = req.body.completed ? 1 : 0;
  const notes = String(req.body.notes || "");
  await query(`
    INSERT INTO week_progress (user_id, week_number, completed, notes)
    VALUES (:userId, :weekNumber, :completed, :notes)
    ON DUPLICATE KEY UPDATE completed = VALUES(completed), notes = VALUES(notes)
  `, { userId: req.user.id, weekNumber, completed, notes });
  res.json({ ok: true });
});

router.put("/leetcode/:weekNumber/:problemIndex", async (req, res) => {
  const weekNumber = Number(req.params.weekNumber);
  const problemIndex = Number(req.params.problemIndex);
  const completed = req.body.completed ? 1 : 0;
  const note = String(req.body.note || "");
  await query(`
    INSERT INTO leetcode_progress (user_id, week_number, problem_index, completed, note)
    VALUES (:userId, :weekNumber, :problemIndex, :completed, :note)
    ON DUPLICATE KEY UPDATE completed = VALUES(completed), note = VALUES(note)
  `, { userId: req.user.id, weekNumber, problemIndex, completed, note });
  res.json({ ok: true });
});

export default router;
