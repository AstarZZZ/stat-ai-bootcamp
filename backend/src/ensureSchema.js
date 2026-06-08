import { query } from "./db.js";

let taskProgressReady = false;
let quizSchemaReady = false;

export async function ensureTaskProgressTable() {
  if (taskProgressReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS task_progress (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      week_number TINYINT UNSIGNED NOT NULL,
      task_key VARCHAR(40) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      note TEXT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_task_progress (user_id, week_number, task_key),
      CONSTRAINT fk_task_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  taskProgressReady = true;
}

export async function ensureQuizSchema() {
  if (quizSchemaReady) return;

  await query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(180) NOT NULL,
      description TEXT NULL,
      created_by BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_quizzes_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  const columns = await query(`
    SELECT column_name AS columnName
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'questions'
      AND column_name = 'quiz_id'
  `);
  if (!columns.length) {
    await query("ALTER TABLE questions ADD COLUMN quiz_id BIGINT UNSIGNED NULL AFTER id");
  }

  const indexes = await query(`
    SELECT index_name AS indexName
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'questions'
      AND index_name = 'idx_questions_quiz_id'
    LIMIT 1
  `);
  if (!indexes.length) {
    await query("ALTER TABLE questions ADD INDEX idx_questions_quiz_id (quiz_id)");
  }

  const constraints = await query(`
    SELECT constraint_name AS constraintName
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'questions'
      AND constraint_name = 'fk_questions_quiz'
      AND constraint_type = 'FOREIGN KEY'
    LIMIT 1
  `);
  if (!constraints.length) {
    await query("ALTER TABLE questions ADD CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE");
  }

  const [defaultQuiz] = await query("SELECT id FROM quizzes ORDER BY id ASC LIMIT 1");
  let defaultQuizId = defaultQuiz?.id;
  if (!defaultQuizId) {
    const result = await query(
      "INSERT INTO quizzes (title, description) VALUES (:title, :description)",
      { title: "默认测验", description: "系统自动创建，用于承接升级前已有题目。" }
    );
    defaultQuizId = result.insertId;
  }

  await query("UPDATE questions SET quiz_id = :quizId WHERE quiz_id IS NULL", { quizId: defaultQuizId });

  quizSchemaReady = true;
}
