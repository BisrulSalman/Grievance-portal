const verifyUserSession = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            message: "Unauthorized: User session required!", 
            redirect: "/pages/login.html" 
        });
    }
    next();
};

const verifyAdminSession = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(401).json({ 
            message: "Unauthorized: Admin session required!", 
            redirect: "/pages/admin-login.html" 
        });
    }
    next();
};

const verifyAnySession = (req, res, next) => {
    if (!req.session.user && !req.session.admin) {
        return res.status(401).json({ 
            message: "Unauthorized: Session required!", 
            redirect: "/pages/login-portal.html" 
        });
    }
    next();
};

module.exports = {
    verifyUserSession,
    verifyAdminSession,
    verifyAnySession
};