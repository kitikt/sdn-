const User = require('../models/user');
const { createUserService, loginUserService, getUserService, changePasswordService, refreshTokenService } = require('../service/authService');

const createUser = async (req, res) => {
    const { username, password } = req.body;

    // Gọi service
    const result = await createUserService(username, password);
    if (!result.success) {
        if (result.error.name === 'ValidationError') {

            let errors = {};
            for (let field in result.error.errors) {
                errors[field] = result.error.errors[field].message;
            }
            return res.status(400).json({ errors });
        } else {
            if (result.error.message.includes("E11000")) {
                result.error.message = "User already exist"
            }
            return res.status(500).json({ error: result.error.message });
        }
    }


    return res.status(201).json({
        message: 'Signup successful!',
        data: result.data,
    });
};

const handleLogin = async (req, res) => {
    try {

        const { username, password } = req.body;
        const data = await loginUserService(username, password);

        if (data.EC) {
            return res.status(400).json({ error: data.EM });
        }
        res.cookie('access_token', data.access_token, {
            httpOnly: true, // Bảo mật, tránh XSS
            secure: false, // Để `true` nếu dùng HTTPS
            sameSite: 'Strict', // Ngăn chặn CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        return res.status(200).json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: data.user
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const handleRefreshToken = async (req, res) => {
    console.log("handleRefreshToken() is called");

    try {
        const { refreshToken } = req.body;
        console.log("Received refreshToken in Controller:", refreshToken);

        if (!refreshToken) {
            console.log("❌ No refresh token provided");
            return res.status(401).json({ EC: 1, EM: "No refresh token provided" });
        }

        const response = await refreshTokenService(refreshToken);
        console.log("🚀 Response from refreshTokenService:", response);

        return res.status(200).json(response);
    } catch (error) {
        console.log("❌ Error in handleRefreshToken:", error.message);
        return res.status(500).json({ EC: 3, EM: "Internal Server Error" });
    }
};



const getUser = async (req, res) => {
    try {
        const data = await getUserService();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const username = req.user.username;
    console.log('check user Controller', username)

    try {

        const data = await changePasswordService(oldPassword, newPassword, username)
        if (!oldPassword || !newPassword) {

            return res.status(400).json({ message: "Old password and new password are required" });

        } else {
            return res.status(201).json(data)
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = { createUser, handleLogin, getUser, changePassword, handleRefreshToken };
