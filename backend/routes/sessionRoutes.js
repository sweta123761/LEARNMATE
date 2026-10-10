import express from 'express';
import { bookSession, getUserSessions, updateSessionStatus, reviewSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/authmiddleware.js';
const router = express.Router();

router.post('/book', protect, bookSession);
router.get('/my-sessions', protect, getUserSessions);
router.patch('/:id/status', protect, updateSessionStatus);
router.post('/:id/review', protect, reviewSession);

export default router;
