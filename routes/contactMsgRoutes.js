import { Router } from 'express';
import Validator from '../middlewares/validationMiddleware.js';
import ContactController from '../controllers/contactMsgController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const router = Router();
const validator = new Validator(); // Create an instance of the Validator class

// Don't forget to add the validation middleware
router.post(
    '/',
    validator.validateContactForm(),
    validator.handleValidationErrors(),
    ContactController.saveContactMessage
);

router.post(
    '/reply-message/:messageID',
    validator.validateReplyForm(),
    validator.handleValidationErrors(),
    ContactController.replyToMessage
);

router.post(
    '/delete-message/:messageID',
    AuthMiddleware.hasPermission(7),
    ContactController.deleteMessage
);

export default router;
