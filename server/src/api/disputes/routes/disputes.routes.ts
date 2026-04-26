import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { openDispute, getDispute, listDisputes } from '../controllers/dispute.controller';

const router = Router();

// POST /disputes        — raise a dispute
router.post('/', authMiddleware, openDispute);

// GET  /disputes        — list all disputes for logged-in user
router.get('/', authMiddleware, listDisputes);

// GET  /disputes/:id    — get a single dispute
router.get('/:id', authMiddleware, getDispute);

export default router;
