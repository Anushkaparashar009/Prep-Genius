import express from 'express';
import multer from 'multer';
import { analyzeResume, getAuditHistory } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

    if (isPdfMime && isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF documents (.pdf) are allowed.'), false);
    }
  },
});

router.post('/analyze', protect, upload.single('resume'), analyzeResume);
router.get('/history', protect, getAuditHistory);

export default router;