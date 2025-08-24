// api-gateway/src/routes/index.ts
import { Router } from 'express';
import marketProxy from './marketProxy';
import userProxy from './userProxy';

const router = Router();

// Mount all route modules
router.use(marketProxy);
router.use(userProxy);

export default router;
