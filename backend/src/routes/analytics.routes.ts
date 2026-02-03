import { Router } from 'express';
import { recordVisit, getAdvertiserPerformance, getAdminPerformance } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public route to record visits
router.post('/visit', recordVisit);

// Protected route for advertisers to view stats
router.get('/performance', authenticate, authorize(['ADVERTISER', 'SUPER_ADMIN']), getAdvertiserPerformance);

// Admin route for global performance
router.get('/admin/performance', authenticate, authorize(['SUPER_ADMIN', 'SUB_ADMIN']), getAdminPerformance);

export default router;
