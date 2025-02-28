const jwt = require('jsonwebtoken');
require('dotenv').config();

const white_lists = ["/", "/signup", "/login", "/refresh"];

const auth = (req, res, next) => {
    console.log('🔹 Check req.originalUrl:', req.originalUrl);

    // Nếu URL thuộc whitelist, bỏ qua xác thực
    if (white_lists.includes(req.originalUrl)) {
        return next();
    }

    // Lấy token từ Cookies trước
    let token = req.cookies.access_token;
    if (!token) {
        console.log("❌ No token in cookies, checking Authorization header...");

        // Nếu không có trong cookies, thử lấy từ headers
        const authHeader = req.headers.authorization;
        console.log("🔹 Authorization Header:", authHeader);

        if (!authHeader) {
            return res.status(401).json({ message: "You don't have access token" });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
            return res.status(401).json({ message: "Token malformatted" });
        }

        token = parts[1]; // Cập nhật token từ headers nếu không có trong cookies
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("✅ Decoded Token:", req.user);

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            error: error.message
        });
    }
};

module.exports = auth;
