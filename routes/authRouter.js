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
    res.render('signup')
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

module.exports = router;
