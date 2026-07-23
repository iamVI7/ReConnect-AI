import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { create, list, verify, markFalse } from './sighting.controller.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';

const router = Router();

// 5/hour per IP, per the API Specification — sightings are the one
// endpoint that's reachable without an account, so it needs its own limit.
const sightingLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

router.post('/', sightingLimiter, optionalAuthenticate, create);
router.get('/', authenticate, list);
router.post('/:id/verify', authenticate, requireRole('police'), verify);
router.post('/:id/mark-false', authenticate, requireRole('police'), markFalse);

export default router;