import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/usersModel.js';
import sendEmail from '../utils/sendEmail.js';
import * as emailTemplate from '../utils/emailTemplate.js';

/**
 * AuthController handles all authentication and user management operations
 */
class AuthController {
    /**
     * Register a new user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async registerUser(req, res, next) {
        try {
            // Check if user already exists
            const existingUser = await User.getUserByEmail(req.body.email.toLowerCase());
            if (existingUser) {
                req.flash('error', 'Email is already registered.');
                return res.status(400).redirect('/edap/login');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            // Generate confirmation token and expiry
            const confirmationToken = crypto.randomBytes(32).toString('hex');
            // Convert to MySQL DATETIME format - 24 hours
            const tokenExpiryUTC = new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');

            // Create user in database
            await User.createUser(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                hashedPassword,
                confirmationToken,
                tokenExpiryUTC
            );

            // Send confirmation email
            const confirmUrl = `https://138.197.92.120/edap/auth/confirm-email/${confirmationToken}`;
            const emailContent = emailTemplate.confirmationTemplate(confirmUrl);
            await sendEmail(req.body.email.toLowerCase(), 'Confirm Your Email', emailContent);

            req.flash(
                'success',
                'Account created successfully. Please check your email to confirm your account.'
            );
            res.status(201).redirect('/edap/login');
        } catch (error) {
            console.error('Register User Error:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Confirm a user's email address
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async confirmEmail(req, res, next) {
        try {
            const user = await User.getUserByConfirmationToken(req.params.token);

            if (!user) {
                req.flash('error', 'Invalid or expired confirmation link.');
                return res.status(400).redirect('/edap/login');
            }

            await User.activateUser(user.employee_id);

            req.flash('success', 'Email confirmed successfully. You can now log in.');
            res.redirect('/edap/login');
        } catch (error) {
            console.error('Email Confirmation Error:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Login a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async loginUser(req, res, next) {
        try {
            const email = req.body.email.toLowerCase();
            const user = await User.getUserByEmail(email);

            if (!user) {
                req.flash('error', 'User not found.');
                return res.status(404).redirect('/edap/login');
            }

            if (user.is_active !== 1) {
                req.flash(
                    'error',
                    'Please activate your account using the link sent to your email!'
                );
                return res.status(403).redirect('/edap/login');
            }

            const isMatch = await bcrypt.compare(req.body.password, user.password);

            if (!isMatch) {
                req.flash('error', 'Invalid password.');
                return res.status(401).redirect('/edap/login');
            }

            // Fetch user role and permissions
            const userPermissions = await User.getUserRoleAndPermissions(user.employee_id);

            if (!userPermissions) {
                req.flash('error', 'User role or permissions not found.');
                return res.status(403).redirect('/edap/login');
            }

            // Store user info and permissions in session
            req.session.user = {
                id: user.employee_id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                profileImage: user.profile_image,
                role: userPermissions.role,
                permissions: parseInt(userPermissions.permissions),
            };

            req.flash('success', `Welcome, ${user.first_name}!`);
            // anyone logging in with permission below 6 get redirected to their account settings
            return res.redirect(
                parseInt(userPermissions.permissions) == 7
                    ? '/edap/dashboard'
                    : '/edap/dashboard/account'
            );
        } catch (error) {
            console.error('Login Error:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Update a user's profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async updateProfile(req, res, next) {
        try {
            const { userId, firstName, lastName, roleId, currentPassword, newPassword } = req.body;
            const sessionUser = req.session.user;

            // Determine if the update is self-update or an executive update
            const isSelfUpdate = !userId || userId === sessionUser.id;
            const targetUserId = isSelfUpdate ? sessionUser.id : userId;

            // Fetch existing user data
            const existingUser = await User.getUserByEmployeeId(targetUserId);
            if (!existingUser) {
                req.flash('error', 'User not found.');
                return res.status(404).redirect('/edap/login');
            }

            // Password update logic (only for self-update)
            if (isSelfUpdate && currentPassword && newPassword) {
                const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
                if (!isMatch) {
                    req.flash('error', 'Current password is incorrect.');
                    return res.status(401).redirect('/edap/dashboard/account');
                }

                const hashedNewPassword = await bcrypt.hash(newPassword, 10);
                await User.updatePassword(targetUserId, hashedNewPassword);
            }

            // Profile image update
            const updatedProfilePic = req.file ? req.file.filename : existingUser.profile_image;

            // Use provided values or keep existing values
            const updatedFirstName = firstName || existingUser.first_name;
            const updatedLastName = lastName || existingUser.last_name;

            // If an executive is updating another user, allow role change
            let updatedRole = existingUser.role_id;
            if (!isSelfUpdate && roleId) {
                updatedRole = roleId;
            }

            // Update user profile and role
            await User.updateUser(
                targetUserId,
                updatedFirstName,
                updatedLastName,
                updatedRole,
                updatedProfilePic
            );

            req.flash(
                'success',
                isSelfUpdate ? 'Profile Updated Successfully' : 'User Updated Successfully'
            );

            // Redirect based on who updated
            return res.redirect(isSelfUpdate ? '/edap/dashboard/account' : '/edap/dashboard/users');
        } catch (error) {
            console.error('Update Profile Error:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Delete a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async deleteUser(req, res, next) {
        try {
            const { userId } = req.body;
            const sessionUser = req.session.user;

            // Ensure the user is not deleting themselves
            if (userId === sessionUser.id) {
                req.flash('error', 'You cannot delete your own account.');
                return res.status(400).redirect('/edap/dashboard/users');
            }

            // Proceed with deletion
            await User.deleteUser(userId);
            req.flash('success', 'User deleted successfully.');
            res.status(200).redirect('/edap/dashboard/users');
        } catch (error) {
            console.error('Delete User Error:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Logout a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async logoutUser(req, res, next) {
        try {
            req.flash('success', 'Logged out successfully.');
            req.session.destroy((err) => {
                if (err) {
                    console.error('Logout Error:', err);
                    return next(err); // Pass session destruction error to middleware
                }
                res.clearCookie('connect.sid');
                res.redirect('/edap/login');
            });
        } catch (error) {
            console.error('Unexpected Logout Error:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Handle forgot password request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async forgotPassword(req, res, next) {
        try {
            const user = await User.getUserByEmail(req.body.email);

            if (!user) {
                req.flash('error', 'No account with that email found.');
                return res.status(404).redirect('/edap/forgot-password');
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 3600000)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');

            await User.storeResetToken(user.employee_id, resetToken, resetTokenExpiry);

            const resetUrl = `https://138.197.92.120/edap/reset-password/${resetToken}`;
            const emailContent = emailTemplate.resetPasswordTemplate(resetUrl);
            await sendEmail(user.email, 'Reset Your Password', emailContent);

            req.flash('success', 'Password reset link sent to your email.');
            res.status(200).redirect('/edap/forgot-password');
        } catch (error) {
            console.error('Forgot Password Error:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }

    /**
     * Reset the password using the provided token
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async resetPassword(req, res, next) {
        try {
            const user = await User.getUserByResetToken(req.params.token);

            if (!user) {
                req.flash('error', 'Invalid or expired password reset link.');
                return res.status(400).redirect('/edap/reset-password');
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await User.updatePassword(user.employee_id, hashedPassword);

            req.flash('success', 'Password successfully reset.');
            res.status(200).redirect('/edap/login');
        } catch (error) {
            console.error('Reset Password Error:', error);
            next(error); // Pass error to the error-handling middleware
        }
    }
}

export default new AuthController();
