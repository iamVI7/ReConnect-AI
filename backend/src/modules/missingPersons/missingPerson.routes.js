import { Router } from 'express';
import { create, list, getById, update, remove } from './missingPerson.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';

const router = Router();

// Every route here requires a signed-in user — matching the
// Access column ('Family', 'Owner, Police, Admin', etc.) in the API Spec.
router.use(authenticate);

router.post('/', requirePermission('case:create'), create);
router.get('/', list);
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;