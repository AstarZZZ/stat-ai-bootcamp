import { query } from "./db.js";

let taskProgressReady = false;

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
