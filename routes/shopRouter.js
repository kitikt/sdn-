const express = require('express');
const { getProductsController, logoutController, createProductController, addToCartController, getCartController, removeFromCartController, getProductDetailController, getAddProductPage, postAddProduct, editProductController, getEditProductPage, deleteProductController, getProductCollectionController, createPaymentController, receiveWebhookController } = require('../controller/shopController');

const authOptional = require('../middleware/authOptional');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/upload');
const router = express.Router();
const webhookUrl = 'null'

router.get('/logout', logoutController)

router.get("/", authOptional, getProductCollectionController, (req, res) => {

    return res.render("index", {
        prods: req.products,
        pageTitle: "Resonance",
        path: "/"
    });
});


router.get('/admin/add-product', auth, isAdmin, getAddProductPage)
router.post('/admin/add-product', auth, isAdmin, upload.single('image'), postAddProduct);
router.get('/product', authOptional, getProductsController, (req, res) => {
    return res.render('product', {
        prods: req.products,
        pageTitle: "All Product",
        path: "/product"
    })
})
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

router.post('/cart/remove', authOptional, upload.none(), removeFromCartController, (req, res) => {
    res.json({ success: true, message: "Product removed from cart!" });
});
router.post('/receive-hook', async (req, res) => {
    console.log('Nhận request webhook:', req.body);

    try {
        await receiveWebhookController(req, res);
    } catch (error) {
        console.error(" Lỗi trong router /receive-hook:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});


router.post('/create-payment-link', auth, getCartController, createPaymentController)


// router.post('/create-payment-link', getCartController, async (req, res) => {
//     console.log('check req total price', req.totalPrice)
//     const order = {
//         amount: (req.totalPrice) * 25000,
//         description: 'Payment for Resonance',
//         orderCode: Math.floor(Math.random() * 1000000) + 1,
//         returnUrl: 'http://localhost:3009/success',
//         cancelUrl: 'http://localhost:3009/cancel',

//     }

//     console.log('check ammount', order?.amount)
//     const paymentLink = await payos.createPaymentLink(order);
//     res.redirect(303, paymentLink.checkoutUrl)
// })

module.exports = router;

