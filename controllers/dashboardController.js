import path from 'path';
import fs from 'fs';
import moment from 'moment';
import User from '../models/usersModel.js';
import ContactMessage from '../models/contactMsgModel.js';

/**
 * Controller class responsible for handling dashboard-related routes
 * and rendering corresponding views with appropriate data
 */
class DashboardController {
    /**
     * Renders the main dashboard view with Power BI embedding details
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getDashboard(req, res, next) {
        const loggedUser = req.session.user;
        try {
            // Render the dashboard view with Power BI embedding parameters
            res.status(200).render('dashboard/dashboard', {
                embedUrl: process.env.POWER_BI_EMBED_URL,
                reportId: process.env.POWER_BI_REPORT_ID,
                accessToken: process.env.POWER_BI_ACCESS_TOKEN,
                loggedUser,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves and displays paginated list of users with search functionality
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getUsers(req, res, next) {
        const limit = 10; // Number of users per page
        let page = parseInt(req.query.page, 10);
        page = isNaN(page) || page < 1 ? 1 : page;
        const offset = (page - 1) * limit;
        const searchQuery = req.query.search ? req.query.search.trim() : '';
        const loggedUser = req.session.user;

        try {
            const users = await User.getUsers(limit, offset, searchQuery);
            const totalUsers = await User.getTotalUserCount(searchQuery);
            const totalPages = Math.ceil(totalUsers / limit);
            page = Math.min(page, totalPages || 1);

            res.status(200).render('dashboard/components/users', {
                users,
                current: page,
                totalPages,
                loggedUser,
                searchQuery,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves and displays all contact messages with formatted dates
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getContactMessages(req, res, next) {
        try {
            const loggedUser = req.session.user;

            let messages = (await ContactMessage.getAllMessages()) || [];

            const updatedMessages = messages.map((msg) => ({
                ...msg,
                formattedDate: moment(msg.created_at).format('YYYY-MM-DD - HH:mm:ss'),
                repliedFormattedDate: msg.replied_at
                    ? moment(msg.replied_at).format('YYYY-MM-DD - HH:mm:ss')
                    : null,
            }));

            // Render contact messages view
            res.status(200).render('dashboard/components/contactMessages', {
                messages: updatedMessages,
                loggedUser,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves and displays the user account information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getAccount(req, res, next) {
        try {
            const loggedUser = req.session.user;
            const user = await User.getUserByEmployeeId(loggedUser.id);

            // Check if user profile image exists and set default if not
            if (
                !user.profile_image ||
                !fs.existsSync(path.join('public', 'uploads', user.profile_image))
            ) {
                user.profile_image = 'profile.png';
            }
            // Generate the complete URL for the profile image (ensure it has '/edap' path)
            user.profile_image_url = `/edap/uploads/${user.profile_image}`;

            res.status(200).render('dashboard/components/account', {
                user,
                loggedUser,
            });
        } catch (error) {
            next(error);
        }
    }
}

// Export a singleton instance of the controller
export default new DashboardController();
