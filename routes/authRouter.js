const express = require('express');
const { handleLogin, getAccount, createUser, changePassword } = require('../controller/authController');

const delay = require('../middleware/delay');
const auth = require('../middleware/auth');
const { getUserDetail, updateUser, deleteUser, createUserAdmin, getAllUser } = require('../controller/adminController');

const router = express.Router();
router.all("*", auth)
// Route đăng ký
router.get('/signup', (req, res) => res.render('signUp.ejs'));
router.post('/signup', createUser);
router.get("/", (req, res) => {
    return res.status(200).json("hello with v1")
})


// Route đăng nhập
router.post('/login', handleLogin);
router.get('/login', (req, res) => res.render('login.ejs'));

// Route yêu cầu xác thực

router.put('/change-password', changePassword);

//admin route
router.get('/user', getAllUser);
router.get('/user/:id', getUserDetail);
router.post('/user', createUserAdmin)
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);


module.exports = router;
