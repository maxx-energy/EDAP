import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import Validator from '../middlewares/validationMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();
const validator = new Validator();  // Create an instance of the Validator class

// Register user
router.post('/edap/register', 
    validator.validateRegistration(), 
    validator.handleValidationErrors(), 
    AuthController.registerUser
);

// Login user
router.post('/edap/login', 
    validator.validateLogin(), 
    validator.handleValidationErrors(), 
    AuthController.loginUser
);

// Update profile
router.post('/edap/update-profile', 
    AuthMiddleware.hasPermission(2),
    upload.single('profileImage'),
    validator.validateProfileUpdate(), 
    validator.handleValidationErrors(), 
    AuthController.updateProfile
);

// Delete user
router.post('/edap/delete-user', 
    AuthMiddleware.hasPermission(6), 
    AuthController.deleteUser
);

// Logout user
router.post('/edap/logout', 
    AuthController.logoutUser
);

// Forgot password
router.post('/edap/forgot-password', 
    validator.validateForgotPassword(), 
    validator.handleValidationErrors(), 
    AuthController.forgotPassword
);

// Reset password
router.post('/edap/reset-password/:token', 
    validator.validateResetPassword(), 
    validator.handleValidationErrors(), 
    AuthController.resetPassword
);

// Confirm email
router.get('/edap/confirm-email/:token', 
    AuthController.confirmEmail
);

export default router;
