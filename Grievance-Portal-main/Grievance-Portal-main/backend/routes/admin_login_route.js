const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin'); // Import Admin model
const router = express.Router();
const AdminSession = require('../models/adminSession');
const { verifyAdminSession } = require('../middleware/sessionAuth');
let sessionLoad= {};
// login session
// router.get('/session', (req, res) => {
//     console.log("Session data in backend:", req.session); // ✅ Debugging log

//     if (!req.session.user) {
//         console.error("❌ Session not found! Redirecting user.");
//         return res.status(401).json({ message: "Not logged in" });
//     }

//     console.log("✅ Sending session data:", req.session.user);
//     res.status(200).json(req.session.user);
// });

router.get("/session", verifyAdminSession, (req, res) => {
    console.log("Session cookie data:", req.session.cookie); // ✅ Logs cookie details
    console.log("Stored session data:", req.session.user); // ✅ Logs user data

    if (!req.session.admin) {
        return res.status(401).json({ message: "Admin session expired or not logged in." });
    }

    res.status(200).json({ cookie: req.session.cookie, admin: req.session.admin });
});

// Login Route
router.post('/check', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ $or: [{ email: username }, { fullname: username }] });

        if (!admin) return res.status(404).json({ message: "Admin not found!" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials!" });

        req.session.admin = {  
            id: admin._id,  
            name: admin.fullname,  
            email: admin.email,  
            position: admin.position,  
            loginTime: new Date()
        };

        sessionData= req.session.admin 
        sessionLoad= sessionData;
        console.log("✨ Admin Session Data Variable:", sessionData);

        // Save session details to MongoDB (`adminSession` collection)
        const newSession = new AdminSession({
            AdminId: admin._id,
            name: admin.fullname,
            email: admin.email,
            sessionData: req.session.admin,
            loginTime: req.session.admin.loginTime
        });

        // Save admin session globally
        if (!global.adminSessions) global.adminSessions = {};
        global.adminSessions[admin._id] = req.session.admin;
        console.log("✅ Admin Session stored:", req.session.admin);

        await newSession.save(); // ✅ Insert session into MongoDB

        res.status(200).json({ message: "Admin login successful!", admin: req.session.admin, isAdmin: true });

    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: "Error logging in", details: error.message });
    }
});


router.post('/', (req, res) => {
    res.send("Login route is respoding.");
});

// Add: logout 
router.post("/logout", async (req, res) => {
    try {
        if (!req.session.admin) return res.status(401).json({ message: "Admin not logged in!" });

        delete global.adminSessions[req.session.admin.id];
        await AdminSession.deleteOne({ AdminId: req.session.admin.id });

        req.session.destroy(err => {
            if (err) return res.status(500).json({ message: "Logout failed" });
            res.clearCookie("connect.sid"); // ✅ Clears session cookie
            res.status(200).json({ message: "Logged out successfully!" });
        });

    } catch (error) {
        console.error("❌ Logout error:", error);
        res.status(500).json({ message: "Error logging out", details: error.message });
    }
});
// Added: logout

router.get("/latest-session", verifyAdminSession, (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Global session data retrieved successfully.",
            data: sessionLoad
        });
    } catch (error) {
        console.error("❌ Error fetching latest session data:", error);
        res.status(500).json({ message: "Error retrieving latest session data.", details: error.message });
    }
});

router.get("/global-session", verifyAdminSession, async (req, res) => {
    try {
        // if (!req.session.user) {
        //     console.error("❌ No session found! Redirecting user.");
        //     return res.status(401).json({ message: "Not logged in." });
        // }

        const adminId = req.session.admin.id;

        // Retrieve admin session from global storage
        const globalSessionData = global.adminSessions ? global.adminSessions[adminId] : null;

        // if (!globalSessionData) {
        //     console.error("❌ No global session found!");
        //     return res.status(404).json({ message: "Session not found in global storage." });
        // }

        console.log("✅ Sending global session data:", globalSessionData);

        // ✅ Send structured data to frontend
        res.status(200).json({
            success: true,
            message: "Global session data retrieved successfully.",
            data: sessionLoad
        });

    } catch (error) {
        console.error("❌ Error fetching global session:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving global session.",
            details: error.message
        });
    }
});

module.exports = router;