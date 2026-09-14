import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// store uploads in backend/uploads with original filename prefixed by timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${ts}-${safe}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// single file upload
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // return a simple url path that the frontend can use to display / download
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ file: { filename: req.file.filename, path: req.file.path, url } });
});

export default router;