const express = require('express');
const { handleLogin, createUser, changePassword, handleRefreshToken } = require('../controller/authController');
const { getUserDetail, updateUser, deleteUser, createUserAdmin, getAllUser } = require('../controller/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

router.get('/signup', (req, res) => {
    if (req.cookies.access_token) {
        return res.redirect('/')
    }
    res.render('signup')
});


router.post('/signup', createUser);


router.get('/login', (req, res) => {
    if (req.cookies.access_token) {
        return res.redirect('/')
    }
    res.render('login')
});



router.post('/login', handleLogin);


router.post('/refresh', handleRefreshToken);



router.put('/change-password', auth, changePassword);


module.exports = router;
