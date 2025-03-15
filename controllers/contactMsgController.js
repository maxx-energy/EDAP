import ContactMessage from '../models/contactMsgModel.js';
import User from '../models/usersModel.js';
import sendEmail from '../utils/sendEmail.js';
import { replyMessageTemplate } from '../utils/emailTemplate.js';

class ContactController {
    /**
     * Save a new customer contact message
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async saveContactMessage(req, res, next) {
        try {
            const { fullName, email, message } = req.body;

            // Check if user exists based on email
            const existingUser = await User.getUserByEmail(email);
            const userId = existingUser ? existingUser.employee_id : null;

            // Save message with or without user_id
            await ContactMessage.createMessage(userId, fullName, email, message);

            req.flash('success', 'Message sent successfully.');
            res.status(200).redirect('/contact');
        } catch (error) {
            console.error('Error saving contact message:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Reply to an existing contact message
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async replyToMessage(req, res, next) {
        try {
            const { messageID } = req.params;
            const repliedByUser = req.session.user;
            const { replyContent, parentMessageId } = req.body;

            await ContactMessage.markAsReplied(
                replyContent,
                parentMessageId,
                messageID,
                repliedByUser.id
            );
            const message = await ContactMessage.getMessageById(messageID);

            // Construct email content using the template
            const emailContent = replyMessageTemplate(
                message.full_name,
                message.message_content,
                message.reply_content
            );

            await sendEmail(
                message.email,
                'RE: EDAP - Your message has been replied',
                emailContent,
                true // Setting `true` means it's an HTML email
            );

            res.redirect('/dashboard/contact-messages');
        } catch (error) {
            console.error('Error replying to message:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Delete a contact message
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async deleteMessage(req, res, next) {
        try {
            const { messageID } = req.params;

            await ContactMessage.deleteMessage(messageID);

            req.flash('success', 'Message deleted successfully.');
            res.redirect('/dashboard/contact-messages');
        } catch (error) {
            console.error('Error deleting message:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }
}

// Export a singleton instance of the controller
export default new ContactController();