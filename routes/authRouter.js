const express = require('express');
const { handleLogin, createUser, getUser } = require('../controller/authController');
const passport = require('passport'); // Thêm passport vào
const delay = require('../middleware/delay');

const router = express.Router();
// router.all("*", delay)
// Route đăng ký
router.get('/signup', (req, res) => res.render('signUp.ejs'));
router.post('/signup', createUser);



// Route đăng nhập
router.post('/login', handleLogin);
router.get('/login', (req, res) => res.render('login.ejs'));

// Route yêu cầu xác thực
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({ user: req.user });  // Trả thông tin người dùng đã xác thực
});
router.get('/user', getUser)

module.exports = router;
