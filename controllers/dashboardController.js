import path from 'path';
import fs from 'fs';
import moment from 'moment';
import User from '../models/usersModel.js';
import ContactMessage from '../models/contactMsgModel.js';

// Utility function for rendering pages
const renderPage = (res, page, data = {}) => {
    res.status(200).render(page, { isUserSignedIn: res.locals.isUserSignedIn, ...data });
};

// Dashboard
export const getDashboard = async (req, res, next) => {
    const POWER_BI_EMBED_URL = process.env.POWER_BI_EMBED_URL;
    const POWER_BI_REPORT_ID = process.env.POWER_BI_REPORT_ID;
    const POWER_BI_ACCESS_TOKEN = process.env.POWER_BI_ACCESS_TOKEN;
    try {
        renderPage(res, 'dashboard/dashboard', {
            embedUrl: POWER_BI_EMBED_URL,
            reportId: POWER_BI_REPORT_ID,
            accessToken: POWER_BI_ACCESS_TOKEN,
        });
    } catch (error) {
        next(error);
    }
};

// Users with pagination
export const getUsers = async (req, res, next) => {
    const limit = 10;
    let page = parseInt(req.query.page, 10);
    page = isNaN(page) || page < 1 ? 1 : page;
    const offset = (page - 1) * limit;

    const searchQuery = req.query.search ? req.query.search.trim() : ''; // Get the search term
    const loggedUser = req.session.user;

    try {
        const users = await User.getUsers(limit, offset, searchQuery);
        const totalUsers = await User.getTotalUserCount(searchQuery); // Modify this function to consider search
        const totalPages = Math.ceil(totalUsers / limit);
        page = Math.min(page, totalPages || 1); // Ensure valid page number

        renderPage(res, 'dashboard/components/users', {
            users,
            current: page,
            totalPages,
            loggedUser,
            searchQuery,
        });
    } catch (error) {
        next(error);
    }
};

// Contact Messages
export const getContactMessages = async (req, res, next) => {
    try {
        const loggedUser = req.session.user;
        const user = await User.getUserByEmployeeId(loggedUser.id);
        let messages = (await ContactMessage.getAllMessages()) || [];

        // Format timestamps without modifying user_id
        const updatedMessages = messages.map((msg) => ({
            ...msg,
            formattedDate: moment(msg.created_at).format('YYYY-MM-DD - HH:mm:ss'),
            repliedFormattedDate: msg.replied_at
                ? moment(msg.replied_at).format('YYYY-MM-DD - HH:mm:ss')
                : null,
        }));

        // Render page
        renderPage(res, 'dashboard/components/contactMessages', {
            messages: updatedMessages,
            user,
            loggedUser,
        });
    } catch (error) {
        next(error);
    }
};

// Account
export const getAccount = async (req, res, next) => {
    try {
        const loggedUser = req.session.user;
        const user = await User.getUserByEmployeeId(loggedUser.id);

        // Ensure a valid profile image path for rendering
        if (
            !user.profile_image ||
            !fs.existsSync(path.join('public', 'uploads', user.profile_image))
        ) {
            user.profile_image = 'profile.png'; // Fallback to default image
        }

        // Construct the correct URL for the profile image
        user.profile_image_url = `/uploads/${user.profile_image}`;

        renderPage(res, 'dashboard/components/account', { user, loggedUser });
    } catch (error) {
        next(error);
    }
};
