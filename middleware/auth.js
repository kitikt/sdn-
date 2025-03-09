const jwt = require('jsonwebtoken');
require('dotenv').config();

const white_lists = ["/signup", "/login", "/refresh"];

const auth = async (req, res, next) => {
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

        token = parts[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        res.locals.user = req.user;
        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            console.log("🔄 Access Token expired, trying to refresh...");

            const refreshToken = req.cookies.refresh_token;
            if (!refreshToken) {
                return res.status(401).json({ message: "Access token expired, no refresh token available" });
            }

            // Gọi trực tiếp service để làm mới Access Token
            const refreshData = await refreshTokenService(refreshToken);

            if (refreshData.EC === 0) {
                const newAccessToken = refreshData.access_token;

                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'Strict',
                    maxAge: 15 * 60 * 1000,
                });

                const newDecoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
                req.user = newDecoded;
                res.locals.user = req.user;

                console.log("✅ New Access Token issued:", newAccessToken);
                return next();
            } else {
                return res.status(403).json({ message: refreshData.EM });
            }
        } else {
            return res.status(401).json({ message: "Invalid token", error: error.message });
        }
    }
};


module.exports = auth;
