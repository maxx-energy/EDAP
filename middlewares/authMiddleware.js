class AuthMiddleware {
    static isAuthenticated(req, res, next) {
        if (!req.session.user) {
            req.flash('error', 'You must be logged in to view this page.');
            return res.redirect('/login');
        }
        return next();
    }

    static hasPermission(requiredPermission) {
        return (req, res, next) => {
            if (!req.session.user || req.session.user.permissions === undefined) {
                req.flash('error', 'Unauthorized access.');
                return res.status(403).redirect('/dashboard/account');
            }

            const userPermissions = parseInt(req.session.user.permissions, 10);

            // Check if the user has the required permission using bitwise AND
            if ((userPermissions & requiredPermission) !== requiredPermission) {
                req.flash('error', 'You do not have permission to access this page.');
                console.log(userPermissions);
                return res.status(403).redirect(userPermissions == 7 ? '/dashboard' : '/dashboard/account');
            }

            return next();
        };
    }
}

export default AuthMiddleware;