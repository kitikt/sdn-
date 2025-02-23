const User = require('../models/user');

require("dotenv").config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const saltRounds = 10
const generateAccessToken = (user) => {
    return jwt.sign(
        { username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE } // VD: "15m"
    );
};
const generateRefreshToken = (user) => {
    return jwt.sign(
        { username: user.username, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE } // Refresh token có thời hạn dài hơn, VD: 7 ngày
    );
};

const createUserService = async (username, password) => {
    try {
        if (password.length < 6) {
            return { success: false, error: new Error('Minimum password length is 6 characters') };
        }
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // Tạo instance của User
        const newUser = new User({
            username,
            password: hashPassword,
            role: 'user',
        });

        // Ép Mongoose chạy validation đầy đủ
        await newUser.validate();

        // Lưu vào DB
        await newUser.save();

        return { success: true, data: newUser };
    } catch (error) {
        return { success: false, error };
    }
};

const loginUserService = async (username, password) => {
    const user = await User.findOne({ username });

    if (!user) {
        return { EC: 1, EM: "Username/Password not valid" };
    }

    const isMatchPassword = bcrypt.compareSync(password, user.password);
    if (!isMatchPassword) {
        return { EC: 2, EM: "Username/Password not valid" };
    }

    // Tạo access token & refresh token
    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    user.refreshTokens = [refresh_token]; // ✅ Ghi đè token mới
    await user.save();

    console.log("✅ Refresh token saved:", user.refreshTokens); // 🛠 Debug database

    return {
        access_token,
        refresh_token,
        user: { username: user.username, role: user.role }
    };
};

// Xử lý Refresh Token
const refreshTokenService = async (refreshToken) => {
    console.log("🔥 Received refreshToken:", refreshToken); // 🛠 Debug token nhận được

    if (!refreshToken) {
        console.log("❌ No refresh token provided");
        return { EC: 1, EM: "No refresh token provided" };
    }

    try {
        // Giải mã token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            console.log("❌ Token verification failed:", err.message);
            return { EC: 3, EM: "Refresh token expired or invalid" };
        }

        console.log("✅ Decoded Token:", decoded);

        // Kiểm tra xem username trong token có hợp lệ không
        if (!decoded.username) {
            console.log("❌ Token không chứa username hợp lệ");
            return { EC: 2, EM: "Invalid refresh token" };
        }

        // Tìm user trong database
        const user = await User.findOne({ username: decoded.username });

        if (!user) {
            console.log("❌ User not found in database");
            return { EC: 2, EM: "Invalid refresh token" };
        }

        console.log("✅ User found:", user.username);
        console.log("🔍 Stored refreshTokens in DB:", user.refreshTokens);

        // Kiểm tra token có khớp với DB không
        if (!user.refreshTokens.includes(refreshToken)) {
            console.log("❌ Refresh token không khớp với database");
            return { EC: 2, EM: "Invalid refresh token" };
        }

        // Nếu hợp lệ, tạo access token mới
        const newAccessToken = generateAccessToken(user);
        console.log("✅ New Access Token:", newAccessToken);
        return { EC: 0, access_token: newAccessToken };

    } catch (error) {
        console.log("❌ Unknown error:", error.message);
        return { EC: 3, EM: "Refresh token expired or invalid" };
    }
};



const getUserService = async () => {
    try {

        let result = await User.find({}).select('-password')
        return result;

    } catch (error) {
        console.log(error)
        return null
    }
}
const changePasswordService = async (oldPassword, newPassword, username) => {
    console.log('check userservice', username)
    const user = await User.findOne({ username })
    console.log('check user', user)

    if (!user) {
        throw new Error("User not found");
    }
    if (oldPassword === newPassword) {
        throw new Error("New password cannot be the same as the old password");
    }
    const isMatchPassword = bcrypt.compareSync(oldPassword, user.password)
    if (isMatchPassword) {
        const hashNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashNewPassword;
        await user.save();
        return { message: "Password changed successfully" };
    } else {
        throw new Error("Old password is incorrect");
    }
}
module.exports = { getUserService, loginUserService, createUserService, changePasswordService, refreshTokenService };
