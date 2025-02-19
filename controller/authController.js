const { createUserService, loginUserService, getUserService } = require('../service/authService');

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

const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const data = await loginUserService(username, password);

        // Nếu loginUserService trả về EC=1,2 => lỗi đăng nhập
        if (data.EC) {
            return res.status(400).json(data);
        }

        // Thành công => 200
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
const getAccount = async (req, res) => {
    try {

        return res.status(200).json(req.user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


module.exports = { createUser, handleLogin, getUser, getAccount };
