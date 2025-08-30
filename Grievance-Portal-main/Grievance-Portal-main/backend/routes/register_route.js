const express=require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Studnet Grievance Portal-Register User");
});

// Register User (POST Request)
// router.post('/data', async (req, res) => {
//     try {
//         const { registrationNumber, fullName, email, password, academicYear, phone, faculty } = req.body;

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "User already registered with this email!" });
//         }

//         // Hash the password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // Create new user with hashed password
//         const newUser = new User({
//             registrationNumber,
//             fullName,
//             email,
//             password: hashedPassword,
//             academicYear,
//             phone,
//             faculty
//         });

//         await newUser.save();
//         res.status(201).json({ message: "User registered successfully!" });
//     } catch (error) {
//         res.status(500).json({ error: "Error registering user", details: error.message });
//     }
// });

router.post('/data', async (req, res) => {
    try {
        console.log("Received registration request:", req.body); // Debugging log

        const { registrationNumber, fullName, email, password, academicYear, phone, faculty } = req.body;
        if (!registrationNumber || !fullName || !email || !password) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered with this email!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
            console.log("Hashed password:", hashedPassword); // Debugging log
        const newUser = new User({
            registrationNumber,
            fullName,
            email,
            password: hashedPassword,
            academicYear,
            phone,
            faculty
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully! Click OK to proceed login" });
    } catch (error) {
        console.error("Error registering user:", error); // Log error details
        res.status(500).json({ error: "Error registering user", details: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Retrieve all users from MongoDB
        res.status(200).json(users); // Send users as JSON response
    } catch (error) {
        res.status(500).json({ error: "Error fetching users", details: error.message });
    }
});



module.exports=router;