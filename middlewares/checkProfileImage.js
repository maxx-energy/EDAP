import path from 'path';
import fs from 'fs';
import User from '../models/usersModel.js';

export const checkProfileImage = async (req, res, next) => {
    try {
        if (req.session.user) {
            const loggedUser = req.session.user;
            const user = await User.getUserByEmployeeId(loggedUser.id);

            // Set default profile image if null or empty
            let profileImage = user.profile_image && user.profile_image.trim() ? user.profile_image : 'profile.png';

            // Construct the image path
            const uploadDir = path.join('public', 'uploads');
            const imagePath = path.join(uploadDir, profileImage);

            // If the file doesn't exist, fall back to default profile image
            if (!fs.existsSync(imagePath)) {
                profileImage = 'profile.png';
            }

            // Set the profile image URL for use in views
            user.profile_image_url = `/edap/uploads/${profileImage}`;  // Updated path here

            // Store user data in locals for all views
            res.locals.user = user;
        }
        next();
    } catch (error) {
        next(error);
    }
};

export default checkProfileImage;
