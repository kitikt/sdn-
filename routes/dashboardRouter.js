const express = require('express');
const { getProductsController, logoutController, createProductController } = require('../controller/shopController');

const authOptional = require('../middleware/authOptional');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

router.get('/logout', logoutController)
router.get('/', authOptional, getProductsController);
router.get('/admin/add-product', auth, isAdmin, (req, res) => {
    res.render('editProduct', {
        pageTitle: 'Add Product',
        path: '/admin/add-product'
    });
});
// router.get('/:id' , getDetailController )
router.post('/admin/add-product', auth, isAdmin, createProductController)
module.exports = router