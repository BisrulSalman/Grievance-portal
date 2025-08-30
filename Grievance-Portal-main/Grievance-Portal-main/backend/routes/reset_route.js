const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/password', async (req, res) => {
    try {
        const { email, username, newPassword } = req.body;

        // Find user by email or username
        const user = await User.findOne({ email, registrationNumber: username });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in database
        user.password = hashedPassword;
        await user.save();

        console.log("Password reset successful!");
        res.status(200).json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(500).json({ error: "Error resetting password", details: error.message });
    }
});

module.exports = router;