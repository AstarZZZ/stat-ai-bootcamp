import fs from "fs/promises";
import path from "path";

const logDir = path.resolve("logs");
const bucketDays = 5;
let writeChain = Promise.resolve();

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function currentLogFile(now = new Date()) {
  const epoch = startOfDay(new Date(2026, 0, 1));
  const today = startOfDay(now);
  const daysSinceEpoch = Math.floor((today - epoch) / 86400000);
  const bucketStart = addDays(epoch, Math.floor(daysSinceEpoch / bucketDays) * bucketDays);
  const bucketEnd = addDays(bucketStart, bucketDays - 1);
  return path.join(logDir, `activity-${formatDate(bucketStart)}_to_${formatDate(bucketEnd)}.log`);
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || req.ip || "unknown";
}

function actor(req) {
  if (!req.user) return null;
  return {
    id: req.user.id,
    username: req.user.username,
    role: req.user.role
  };
}

export function requestMeta(req) {
  return {
    ip: clientIp(req),
    method: req.method,
    path: req.originalUrl || req.url,
    userAgent: req.headers["user-agent"] || "",
    actor: actor(req)
  };
}

export function logEvent(type, action, details = {}, meta = {}) {
  const entry = {
    time: new Date().toISOString(),
    type,
    action,
    ...meta,
    details
  };

  writeChain = writeChain
    .then(async () => {
      await fs.mkdir(logDir, { recursive: true });
      await fs.appendFile(currentLogFile(), `${JSON.stringify(entry)}\n`, "utf8");
    })
    .catch((error) => {
      console.error("Failed to write activity log", error);
    });
}

export function logRequest(type, action, req, details = {}) {
  logEvent(type, action, details, requestMeta(req));
}

export async function listLogFiles() {
  await fs.mkdir(logDir, { recursive: true });
  const files = await fs.readdir(logDir);
  return files
    .filter((file) => /^activity-\d{4}-\d{2}-\d{2}_to_\d{4}-\d{2}-\d{2}\.log$/.test(file))
    .sort()
    .reverse();
}

export async function readLogEntries({ file, type, limit = 300 } = {}) {
  const files = await listLogFiles();
  const selected = file && files.includes(file) ? [file] : files.slice(0, 3);
  const entries = [];

  for (const item of selected.reverse()) {
    const fullPath = path.join(logDir, item);
    const text = await fs.readFile(fullPath, "utf8").catch(() => "");
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (!type || parsed.type === type) {
          entries.push({ file: item, ...parsed });
        }
      } catch {
        entries.push({
          file: item,
          time: "",
          type: "System",
          action: "unparsed-log-line",
          details: { line }
        });
      }
    }
  }

  return entries.slice(-limit).reverse();
}

export function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on("finish", () => {
    if (req.originalUrl?.startsWith("/api/logs")) return;
    logRequest("Access", "http-request", req, {
      status: res.statusCode,
      durationMs: Date.now() - startedAt
    });
  });
  next();
}
