import path from "path";
import fs from "fs";
import multer from "multer";

const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, safe);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("仅支持图片上传"));
    cb(null, true);
  }
});

export function fileUrl(file) {
  return file ? `/uploads/${file.filename}` : null;
}
