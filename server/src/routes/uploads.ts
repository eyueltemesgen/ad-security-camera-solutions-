import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { HttpError, safeFileName, isAllowedImage, isAllowedDocument, writeAudit } from '../utils';
import { requireAdmin, requireAuth } from '../auth';
import { query } from '../db';

const router = Router();

// Single multer instance with secure settings.
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const sub = file.fieldname === 'document' ? 'documents' : 'images';
    const dir = path.join(config.uploadDir, sub);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const { name, ext } = safeFileName(file.originalname);
    cb(null, `${name}.${ext || 'bin'}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxImageBytes, files: 10 },
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype;
    const ok = file.fieldname === 'document' ? isAllowedDocument(mime) : isAllowedImage(mime);
    if (ok) cb(null, true);
    else cb(new HttpError(400, 'File type not allowed. Only images (PNG/JPG/WebP/GIF) and PDFs are accepted.'));
  },
});

function publicUrl(pathPart: string): string {
  return `${config.publicUrl || ''}/uploads/${pathPart}`;
}

// Upload image(s) to /uploads/images
router.post('/image', requireAuth, upload.array('file', 10), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) throw new HttpError(400, 'No file uploaded');
    const mediaRows = [];
    for (const file of files) {
      const relative = path.relative(config.uploadDir, file.path);
      const url = publicUrl(relative);
      const row = await query(
        `insert into media (file_url, file_name, file_type, file_size, alt_text, usage)
         values ($1,$2,$3,$4,$5,$6) returning *`,
        [url, file.originalname, file.mimetype, file.size, req.body.alt_text ?? '', req.body.usage ?? '']
      );
      mediaRows.push(row[0]);
    }
    if (req.user!.role === 'admin') {
      await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'file_uploaded', targetType: 'media', description: `Uploaded ${files.length} file(s)` });
    }
    if (mediaRows.length === 1) {
      const row = mediaRows[0];
      res.status(201).json({ ...row, url: row.file_url, original_name: row.file_name, mime_type: row.file_type, size: row.file_size });
    } else {
      res.status(201).json(mediaRows);
    }
  } catch (err) {
    next(err);
  }
});

/** Guest upload for service-request files (images & PDFs). No auth required. */
router.post('/service-file', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) throw new HttpError(400, 'No file uploaded');
    const relative = path.relative(config.uploadDir, file.path);
    const url = publicUrl(relative);
    res.status(201).json({ url, file_url: url, original_name: file.originalname, file_name: file.originalname, file_type: file.mimetype, file_size: file.size, size: file.size });
  } catch (err) {
    next(err);
  }
});

export default router;