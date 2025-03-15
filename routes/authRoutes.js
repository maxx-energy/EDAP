import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import Validator from '../middlewares/validationMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();
const validator = new Validator();  // Create an instance of the Validator class

// Register user
router.post('/register', 
    validator.validateRegistration(), 
    validator.handleValidationErrors(), 
    AuthController.registerUser
);

// Login user
router.post('/login', 
    validator.validateLogin(), 
    validator.handleValidationErrors(), 
    AuthController.loginUser
);

// Update profile
router.post('/update-profile', 
    AuthMiddleware.hasPermission(2),
    upload.single('profileImage'),
    validator.validateProfileUpdate(), 
    validator.handleValidationErrors(), 
    AuthController.updateProfile
);

// Delete user
router.post('/delete-user', 
    AuthMiddleware.hasPermission(6), 
    AuthController.deleteUser
);

// Logout user
router.post('/logout', 
    AuthController.logoutUser
);

// Forgot password
router.post('/forgot-password', 
    validator.validateForgotPassword(), 
    validator.handleValidationErrors(), 
    AuthController.forgotPassword
);

// Reset password
router.post('/reset-password/:token', 
    validator.validateResetPassword(), 
    validator.handleValidationErrors(), 
    AuthController.resetPassword
);

// Confirm email
router.get('/confirm-email/:token', 
    AuthController.confirmEmail
);

export default router;
