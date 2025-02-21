const jwt = require('jsonwebtoken');
require('dotenv').config();

const white_lists = ["/", "/signup", "/login", "/change-password"];

const auth = (req, res, next) => {
    console.log('check req.originalUrl:', req.originalUrl);

    // Nếu route nằm trong whitelist, bỏ qua xác thực
    if (white_lists.find(item => "/v1" + item === req.originalUrl)) {
        return next();
    }

    // Kiểm tra token trong header Authorization
    const authHeader = req.headers.authorization;
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
        const decoded = jwt.verify(token, process.env.JWT_SECRECT);
        // Gán toàn bộ payload cho req.user (bao gồm id, username, role, iat, exp)
        req.user = decoded;
        console.log("Token decoded:", decoded);

        // Phân quyền dựa trên role:
        // Nếu không phải admin, chỉ cho phép GET (đọc) các thao tác
        if (req.user.role !== 'admin' && req.method !== 'GET') {
            return res.status(403).json({ message: "Access denied: Only admin can perform write operations" });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: "You don't have access token",
            error: error.message
        });
    }
};

module.exports = auth;
