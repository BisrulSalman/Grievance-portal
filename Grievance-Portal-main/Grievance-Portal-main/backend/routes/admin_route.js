const express=require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin'); // Assuming you have an Admin model
const router = express.Router();


router.post('/data', async (req, res) => {
    try {
        console.log("Received registration request:", req.body); // Debugging log

        const { fullname, email, password, position, phonenumber, faculty, department } = req.body;
        if (!fullname || !email || !password || !position || !phonenumber) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Admin already exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("Hashed password:", hashedPassword); // Debugging log

        const newUser = new Admin({
            fullname, email, password : hashedPassword, position, phonenumber
        });

        await newUser.save();
        res.status(201).json({ message: "Admin registered successfully! Click OK to proceed login" });
    } catch (error) {
        console.error("Error registering admin:", error); // Log error details
        res.status(500).json({ error: "Error registering admin", details: error.message });
    }
});

router.get('/admins', async (req, res) => {
    try {
        const admin = await Admin.find(); // Retrieve all users from MongoDB
        res.status(200).json(admin); // Send users as JSON response
    } catch (error) {
        res.status(500).json({ error: "Error fetching admins", details: error.message });
    }
});

module.exports=router;