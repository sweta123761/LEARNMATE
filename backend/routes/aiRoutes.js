import express from 'express';
import { analyzeDoubt } from '../controllers/aiController.js';
import { protect } from '../middleware/authmiddleware.js';
const router = express.Router();

router.post('/analyze', protect, analyzeDoubt);

export default router;