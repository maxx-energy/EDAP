import { body, validationResult } from 'express-validator';

/**
 * Validator class to handle validation rules and errors
 */
class Validator {
    constructor(redirectPath) {
        this.redirectPath = redirectPath || '/'; // Default redirect path if not provided
    }

    // Middleware to handle validation errors
    handleValidationErrors() {
        return (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                req.flash('error', errors.array().map((error) => error.msg).join(' '));
                return res.status(400).redirect(this.redirectPath); // Prevents `next()`
            }
            next(); // Pass control to controller
        };
    }

    // Validation rules for user registration
    validateRegistration() {
        return [
            body('firstName').notEmpty().withMessage('First name is required').trim(),
            body('lastName').notEmpty().withMessage('Last name is required').trim(),
            body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        ];
    }

    // Validation rules for user login
    validateLogin() {
        return [
            body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
            body('password').notEmpty().withMessage('Password is required'),
        ];
    }

    // Validation rules for forgot password request
    validateForgotPassword() {
        return [
            body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
        ];
    }

    // Validation rules for resetting password
    validateResetPassword() {
        return [
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        ];
    }

    // Validation rules for contact form
    validateContactForm() {
        return [
            body('fullName').notEmpty().withMessage('Full name is required').trim(),
            body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
            body('message').notEmpty().withMessage('Message is required').trim(),
        ];
    }

    // Validation rules for updating user profile
    validateProfileUpdate() {
        return [
            body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
            body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
            body('currentPassword').optional({ values: 'falsy' }).isLength({ min: 6 }).withMessage('Current password must be at least 6 characters long'),
            body('newPassword').optional({ values: 'falsy' }).isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
            body('confirmPassword').optional({ values: 'falsy' }).custom((value, { req }) => {
                if (value && value !== req.body.newPassword) {
                    throw new Error('New passwords do not match');
                }
                return true;
            }),
            body('profileImage').optional().isIn(['true', 'false']).withMessage('Invalid value for profilePicChanged'),
        ];
    }

    // Validation rules for replying to a message
    validateReplyForm() {
        return [
            body('replyContent').notEmpty().withMessage('Reply content is required').trim(),
        ];
    }
}

// Exporting the Validator class
export default Validator;
