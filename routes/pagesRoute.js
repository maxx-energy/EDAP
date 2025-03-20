import { Router } from 'express';
import * as pageController from '../controllers/pagesControllers.js';

const router = Router();

router.get('/', pageController.getIndexPage);
router.get('/about', pageController.getAboutPage);
router.get('/contact', pageController.getContactPage);
router.get('/service', pageController.getServicesPage);
router.get('/login', pageController.getLoginPage);
router.get('/faq', pageController.getFaqPage);
router.get('/forgot-password', pageController.getForgotPasswordPage);
router.get('/reset-password/:token', pageController.getResetPasswordPage);

// Catch-all for 404 pages
router.use('*', pageController.getPageNotFound);

export default router;
