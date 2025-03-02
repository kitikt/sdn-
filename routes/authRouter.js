const express = require('express');
const { handleLogin, createUser, changePassword, handleRefreshToken } = require('../controller/authController');
const { getUserDetail, updateUser, deleteUser, createUserAdmin, getAllUser } = require('../controller/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

// Áp dụng middleware auth cho tất cả các route
// router.all("*", auth);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Các API liên quan đến đăng ký, đăng nhập và đổi mật khẩu
 */

/**
 * @swagger
 * /v1/signup:
 *   get:
 *     summary: Render trang signup
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Trang signup hiển thị thành công
 */
router.get('/signup', (req, res) => {
    if (req.cookies.access_token) {
        return res.redirect('/')
    }
    res.render('login')
});

/**
 * @swagger
 * /v1/signup:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "usertest"
 *               password:
 *                 type: string
 *                 example: "abc123"
 *     responses:
 *       201:
 *         description: Signup successful!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/signup', createUser);


/**
 * @swagger
 * /v1/login:
 *   get:
 *     summary: Render trang login
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Trang login hiển thị thành công
 */
router.get('/login', (req, res) => {
    if (req.cookies.access_token) {
        return res.redirect('/')
    }
    res.render('login')
});

/**
 * @swagger
 * /v1/login:
 *   post:
 *     summary: Đăng nhập và lấy token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "usertest"
 *               password:
 *                 type: string
 *                 example: "abc123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token và thông tin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi đăng nhập
 *       500:
 *         description: Server error
 */
router.post('/login', handleLogin);

/**
 * @swagger
 * /v1/refresh:
 *   post:
 *     summary: Làm mới access token bằng refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsIn..."
 *     responses:
 *       200:
 *         description: Trả về access token mới
 *       403:
 *         description: Refresh token không hợp lệ hoặc hết hạn
 */
router.post('/refresh', handleRefreshToken);



/**
 * @swagger
 * /v1/change-password:
 *   put:
 *     summary: Đổi mật khẩu của user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "abc123"
 *               newPassword:
 *                 type: string
 *                 example: "newPass456"
 *     responses:
 *       201:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error (e.g. old password incorrect, or new password same as old)
 *       401:
 *         description: Unauthorized (invalid token)
 */
router.put('/change-password', auth, changePassword);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Các API quản lý user (chỉ admin được phép)
 */

/**
 * @swagger
 * /v1/user:
 *   get:
 *     summary: (Admin) Lấy danh sách tất cả user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Access denied - Only admin can access user management
 */
router.get('/user', auth, isAdmin, getAllUser);

/**
 * @swagger
 * /v1/user/{id}:
 *   get:
 *     summary: (Admin) Lấy thông tin chi tiết của 1 user theo ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Thông tin chi tiết user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/user/:id', auth, isAdmin, getUserDetail);

/**
 * @swagger
 * /v1/user:
 *   post:
 *     summary: (Admin) Tạo user mới
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newuser"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: "user"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
router.post('/user', auth, isAdmin, createUserAdmin);

/**
 * @swagger
 * /v1/user/{id}:
 *   put:
 *     summary: (Admin) Cập nhật thông tin của 1 user theo ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "updatedUser"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: "user"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put('/user/:id', auth, isAdmin, updateUser);

/**
 * @swagger
 * /v1/user/{id}:
 *   delete:
 *     summary: (Admin) Xóa user theo ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user cần xóa
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 */
router.delete('/user/:id', auth, isAdmin, deleteUser);
router.get('/verify-token', (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ valid: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, message: "Invalid token" });
    }
});
module.exports = router;
