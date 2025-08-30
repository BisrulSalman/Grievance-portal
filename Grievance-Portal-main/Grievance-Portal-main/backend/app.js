const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
global.userSessions = {}; // Global JSON variable to store session data
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();
const port = process.env.PORT || 5000;
// Added: cors
app.use(cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5000", "http://127.0.0.1:5000"], // Allow both ports
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true  // Enables session cookies
}));

// Add: the session
app.use(session({
    secret: process.env.SESSION_SECRET,  // Keep your session secret secure
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI, // Connects sessions to MongoDB
        collectionName: "sessions", // Stores session data in "sessions" collection
        ttl: 60 * 60 
    }),
    cookie: {
        secure: false, // true in production with HTTPS
        httpOnly: false, // Allow client-side access for debugging
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'lax' // More permissive for testing
    }
}));
// Added session

app.use(express.json());
const path = require("path");

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, "..")));
app.use("/pages", express.static(path.join(__dirname, "../pages")));
app.use("/scripts", express.static(path.join(__dirname, "../scripts")));
app.use("/styles", express.static(path.join(__dirname, "../styles")));
app.use("/src", express.static(path.join(__dirname, "../src")));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Import Routes
const registerRoute = require("./routes/register_route");
const resetRoute = require("./routes/reset_route");
const loginRoute = require("./routes/login_route");
const adminRegisterRoute = require("./routes/admin_route");
const adminRequest = require("./routes/admin_request");
const adminLoginRoute = require('./routes/admin_login_route');
const complaintRoute= require('./routes/complaint_route');

// Route Setup
app.use("/register", registerRoute);
app.use("/reset", resetRoute);
app.use("/login", loginRoute);
app.use("/admin-register", adminRegisterRoute);
app.use("/admin-request", adminRequest);
app.use('/admin', adminLoginRoute);
app.use('/send-complaint', complaintRoute);

// console.log("MongoDB URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
}).catch(error => {
    console.error("MongoDB Connection Error:", error);
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});