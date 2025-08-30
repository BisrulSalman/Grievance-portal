const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET; // 🔒 Keep this secure

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // ✅ Extract token from header

    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided!" });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token!" });

        req.user = decoded; // ✅ Attach decoded user data to request
        next();
    });
};

module.exports = verifyToken;