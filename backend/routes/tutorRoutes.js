import express from 'express';
import { getTutors } from '../controllers/tutorController.js';
const router = express.Router();

router.get('/', getTutors);

export default router;