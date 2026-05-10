import { Router } from 'express';
import { asyncHandler, authenticate } from '../../middleware/index.js';

import * as controller from './takeaway.controller.js';

const router = Router();

// Public route for customer takeaway app
router.post('/order', asyncHandler(controller.createTakeawayOrder));

// Protected routes for staff dashboard
router.use(authenticate);
router.get('/orders', asyncHandler(controller.getTakeawayOrders));
router.put('/status/:id', asyncHandler(controller.updateTakeawayStatus));

export default router;
