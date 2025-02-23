const User = require('../models/user');
const { createUserService, loginUserService, getUserService, changePasswordService, refreshTokenService } = require('../service/authService');

const createUser = async (req, res) => {
    const { username, password } = req.body;

    // Gọi service
    const result = await createUserService(username, password);
    // Nếu service trả về success = false => có lỗi
    if (!result.success) {
        // Kiểm tra xem có phải ValidationError không
        if (result.error.name === 'ValidationError') {
            // parse lỗi chi tiết từng field
            let errors = {};
            for (let field in result.error.errors) {
                errors[field] = result.error.errors[field].message;
            }
            // Trả về 400 (Bad Request)


            return res.status(400).json({ errors });
        } else {
            // Lỗi khác => 500 (Internal Server Error)
            return res.status(500).json({ error: result.error.message });
        }
    }

    // Nếu thành công => trả về 201 (Created)
    return res.status(201).json({
        message: 'Signup successful!',
        data: result.data, // Bạn có thể chỉ trả username/role nếu muốn ẩn password
    });
};

// controller/authController.js
const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const data = await loginUserService(username, password);

        if (data.EC) {
            return res.status(400).json({ error: data.EM });
        }

        // Trả về cả access_token và refreshToken trong body
        return res.status(200).json({
            access_token: data.access_token,
            refresh_token: data.refresh_token, // 🟢 Trả về refresh token trong body
            user: data.user
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const handleRefreshToken = async (req, res) => {
    console.log("🔥 handleRefreshToken() is called"); // 🛠 Debug

    try {
        const { refreshToken } = req.body;
        console.log("🔥 Received refreshToken in Controller:", refreshToken); // 🛠 Debug

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
