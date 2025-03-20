import { Router } from 'express';
import * as pageController from '../controllers/pagesControllers.js';

const router = Router();

router.get('/edap/', pageController.getIndexPage);
router.get('/edap/about', pageController.getAboutPage);
router.get('/edap/contact', pageController.getContactPage);
router.get('/edap/service', pageController.getServicesPage);
router.get('/edap/login', pageController.getLoginPage);
router.get('/edap/faq', pageController.getFaqPage);
router.get('/edap/forgot-password', pageController.getForgotPasswordPage);
router.get('/edap/reset-password/:token', pageController.getResetPasswordPage);

// Catch-all for 404 pages
router.use('*', pageController.getPageNotFound);

export default router;
