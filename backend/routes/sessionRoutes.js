import express from 'express';
import { bookSession, getUserSessions } from '../controllers/sessionController.js';
import { protect } from '../middleware/authmiddleware.js';
const router = express.Router();

router.post('/book', protect, bookSession);
router.get('/my-sessions', protect, getUserSessions);

export default router;