const jwt = require('jsonwebtoken');
require('dotenv').config();

const white_lists = ["/", "/signup", "/login"];

const auth = (req, res, next) => {
    console.log('check req.originalUrl:', req.originalUrl);

    // Nếu route nằm trong whitelist (được nối với /v1), bỏ qua xác thực
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
        // Gán toàn bộ payload cho req.user (bao gồm role)
        req.user = decoded; // decoded = { username, role, iat, exp }
        console.log("Token decoded:", decoded);

        // Nếu là admin thì cho phép vào tất cả các route (CRUD, view,...)
        if (req.user.role === 'admin') {
            return next();
        }

        // Nếu không phải admin (user thường), chỉ cho phép các GET request (xem) 
        // và không cho phép truy cập các route quản lý user (ví dụ: /v1/user)
        if (req.method !== 'GET') {
            return res.status(403).json({ message: "Access denied: Only admin can perform write operations" });
        }
        if (req.originalUrl.startsWith('/v1/user')) {
            return res.status(403).json({ message: "Access denied: Only admin can access user management" });
        }

        // Cho phép truy cập nếu không vi phạm điều kiện trên (chỉ GET và không phải user management)
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "You don't have access token",
            error: error.message
        });
    }
};

module.exports = auth;
