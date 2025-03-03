const express = require('express');
const { getProductsController, logoutController, createProductController, addToCartController, getCartController, removeFromCartController } = require('../controller/shopController');

const authOptional = require('../middleware/authOptional');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

router.get('/logout', logoutController)
router.get("/", authOptional, getProductsController, (req, res) => {
    res.render("product", {
        prods: req.products,
        pageTitle: "All Products",
        path: "/"
    });
});

router.get('/admin/add-product', auth, isAdmin, (req, res) => {
    res.render('addProduct', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',


    });
});
router.get('/:id',)
// router.get('/:id' , getDetailController )
router.post('/admin/add-product', auth, isAdmin, createProductController)

router.get('/admin/edit-product', auth, isAdmin, getProductsController, (req, res) => {
    res.render('adminEditProduct', {
        prods: req.products,
        pageTitle: 'Edit Product',
        path: '/admin/edit-product'
    })
})
router.get('/cart/items', authOptional, getCartController, (req, res) => {
    res.json({ cart: req.cart, totalPrice: req.totalPrice });
});

router.get('/cart', authOptional, getCartController, (req, res) => {
    res.render('cart', {
        cart: req.cart,
        totalPrice: req.totalPrice,
        pageTitle: 'Your Cart',
        path: '/cart'
    });
});

// API thêm sản phẩm vào giỏ hàng (trả về JSON)
router.post('/cart/add', authOptional, addToCartController, (req, res) => {
    res.json({ success: true, message: "Product added to cart!" });
});

// API xóa sản phẩm khỏi giỏ hàng (trả về JSON)
router.post('/cart/remove', authOptional, removeFromCartController, (req, res) => {
    res.json({ success: true, message: "Product removed from cart!" });
});

module.exports = router;

