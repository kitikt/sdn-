const jwt = require('jsonwebtoken');
require('dotenv').config();

const white_lists = ["/", "/signup", "/login", "/refresh"];

const auth = (req, res, next) => {
    console.log(' Check req.originalUrl:', req.originalUrl);

    if (white_lists.includes(req.originalUrl)) {
        return next();
    }

    const authHeader = req.headers.authorization;
    console.log(" Authorization Header:", authHeader);

    if (!authHeader) {
        return res.status(401).json({ message: "You don't have access token" });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
        return res.status(401).json({ message: "Token malformatted" });
    }

    const token = parts[1];

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(" Decoded Token:", req.user);

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            error: error.message
        });
    }
};

module.exports = auth;
