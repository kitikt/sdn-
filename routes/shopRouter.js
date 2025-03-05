const express = require('express');
const { getProductsController, logoutController, createProductController, addToCartController, getCartController, removeFromCartController, getProductDetailController, getAddProductPage, postAddProduct, editProductController, getEditProductPage, deleteProductController } = require('../controller/shopController');

const authOptional = require('../middleware/authOptional');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/logout', logoutController)
router.get("/", authOptional, getProductsController, (req, res) => {
    res.render("product", {
        prods: req.products,
        pageTitle: "All Products",
        path: "/"
    });
});

router.get('/admin/add-product', auth, isAdmin, getAddProductPage)
router.post('/admin/add-product', auth, isAdmin, upload.single('image'), postAddProduct);

router.get('/product/:id', authOptional, getProductDetailController, (req, res) => {
    res.render("productDetail", {
        product: product,
        pageTitle: product.name,
        path: `/product/${productId}`
    });
});

router.post('/admin/add-product', auth, isAdmin, createProductController)

router.get('/admin/edit-product', auth, isAdmin, getProductsController, (req, res) => {
    res.render('adminEditProduct', {
        prods: req.products,
        pageTitle: 'Edit Product',
        path: '/admin/edit-product'
    })
})
router.get('/admin/edit-product/:id', auth, isAdmin, getEditProductPage);

router.post("/admin/edit-product/:id", auth, isAdmin, upload.single('image'), editProductController);
router.post("/admin/delete-product/:id", auth, isAdmin, deleteProductController);

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

router.post('/cart/add', authOptional, upload.none(), addToCartController, (req, res) => {
    res.json({ success: true, message: "Product added to cart!" });
});

router.post('/cart/remove', authOptional, removeFromCartController, (req, res) => {
    res.json({ success: true, message: "Product removed from cart!" });
});

module.exports = router;

