import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', service: 'reconnect-ai-backend', timestamp: new Date().toISOString() },
    error: null,
    meta: {},
  });
});

export default router;
