import { Router } from 'express';
import DashboardController from '../controllers/dashboardController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import checkProfileImage from '../middlewares/checkProfileImage.js';

const router = Router();

// Apply authentication middleware to all dashboard routes
router.use(AuthMiddleware.isAuthenticated);
router.use(checkProfileImage);

/**
 * hasPermission middleware: checks the required permission for each route.
 * While permission level 0 has no access, permission level 7 has full access.
 */
router.get('/', AuthMiddleware.hasPermission(7), DashboardController.getDashboard);
router.get('/users', AuthMiddleware.hasPermission(6), DashboardController.getUsers);
router.get('/contact-messages', AuthMiddleware.hasPermission(6), DashboardController.getContactMessages); // customer inquiries
router.get('/account', AuthMiddleware.hasPermission(2), DashboardController.getAccount);

export default router;
