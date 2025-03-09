const Category = require("../models/category");
const Product = require("../models/product");
const { getAllProducts, createProductService, getCartService, getTotalPriceService, addCartService, removeCartService, getProductByIdService, deleteProductAdminService, editProductAdminService, createOrderService, createPaymentLinkService, handleWebhookService, verifySignature } = require("../service/shopService");
const crypto = require('crypto');



const getProductsController = async (req, res, next) => {
    try {
        const products = await getAllProducts();
        req.products = products
        next()
    } catch (err) {
        console.log(err);
        next(err);
    }
};

const getProductCollectionController = async (req, res, next) => {
    try {
        const allProducts = await getAllProducts();
        const shuffledProducts = [...allProducts].sort(() => 0.5 - Math.random());

        const randomProducts = shuffledProducts.slice(0, 6);
        req.products = randomProducts
        next()
    } catch (error) {
        console.error("Error fetching products collection", error)
        next(error)
    }
}
const createProductController = async (req, res) => {
    try {
        const { name, title, image, price, description, categoryId } = req.body;

        // Thêm sản phẩm mới vào cơ sở dữ liệu
        const newProduct = await createProductService({ name, title, image, price, description, categoryId });

        // Redirect đến trang sản phẩm sau khi tạo thành công
        res.redirect('/product'); // Hoặc redirect đến trang quản lý sản phẩm

    } catch (error) {
        console.log(error);
        res.status(500).send('Error adding product');
    }
};

const logoutController = (req, res) => {
    if (req.session) {
        res.clearCookie('connect.sid');
        res.clearCookie('access_token');
        req.session.destroy((err) => {
            if (err) {
                console.log('Lỗi khi hủy phiên:', err);
                return res.redirect('/');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};

const getCartController = (req, res, next) => {
    req.cart = getCartService(req.session);
    console.log("Cart data:", req.cart);
    req.totalPrice = getTotalPriceService(req.cart);
    next();
};
const getProductDetailController = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await getProductByIdService(productId);

        if (!product) {
            return res.status(404).render('error', { message: "Product not found!" });
        }


        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(product);
        }





        res.render("productDetail", {
            product: product,
            pageTitle: product.name,
            path: `/product/${productId}`
        });

    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).render('error', { message: "Server Error" });
    }
};

const postAddProduct = async (req, res) => {
    try {
        const category = await Category.findById(req.body.categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        let productData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            categoryId: req.body.categoryId
        };

        if (req.file) {
            productData.image = '/uploads/' + req.file.filename;
        }

        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();

        await Category.findByIdAndUpdate(req.body.categoryId, { $push: { products: savedProduct._id } });


        res.redirect('/admin/add-product?success=true');

    } catch (err) {
        console.error("Error uploading product:", err);
        res.status(400).json({ error: err.message });
    }
};

const getAddProductPage = async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('addProduct', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            categories: categories,
            success: req.query.success || false
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Server Error");
    }
};




const addToCartController = (req, res, next) => {
    console.log("Received data:", req.body);

    const { productId, name, price, image } = req.body;

    // Kiểm tra nếu dữ liệu bị thiếu
    if (!productId || !name || !price || !image) {
        console.error(`❌ Lỗi: Dữ liệu sản phẩm không hợp lệ!`, req.body);
        return res.status(400).json({ success: false, message: "Invalid product data" });
    }

    // Chuyển đổi giá trị price sang số
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
        console.error(`❌ Lỗi: Giá sản phẩm không hợp lệ!`, price);
        return res.status(400).json({ success: false, message: "Invalid product price" });
    }

    addCartService(req.session, { productId, name, price: priceNum, image });

    console.log("Cart after adding:", req.session.cart); // Kiểm tra giỏ hàng sau khi thêm
    res.json({ success: true, message: "Product added to cart!" });
};

const removeFromCartController = (req, res, next) => {
    const { productId } = req.body;
    removeCartService(req.session, productId);
    next();
};
const getEditProductPage = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        const categories = await Category.find();

        if (!product) {
            return res.status(404).send("Product not found!");
        }

        res.render('editProductItem', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            product,
            categories
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Server Error");
    }
};

// Cập nhật sản phẩm
const editProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, categoryId } = req.body;

        let updateData = { name, description, price, categoryId };

        if (req.file) {
            updateData.image = '/uploads/' + req.file.filename;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).send("Product not found!");
        }

        res.redirect('/admin/edit-product');
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Server Error");
    }
};

// Xóa sản phẩm
const deleteProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found!" });
        }
        if (deletedProduct.categoryId) {
            await Category.findByIdAndUpdate(deletedProduct.categoryId, { $pull: { products: deletedProduct._id } }, { new: true });
        }

        res.redirect("/admin/edit-product?success=true")
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Server Error" });
    }
}
const receiveWebhookController = async (req, res) => {
    try {

        const { data, signature } = req.body;

        if (!verifySignature(data, signature)) {
            console.warn(" Chữ ký không hợp lệ, từ chối xử lý webhook!");
            return res.status(400).json({ error: "Chữ ký không hợp lệ!" });
        }

        const updatedOrder = await handleWebhookService(req.body);
        res.status(200).json({ message: 'Webhook processed successfully', order: updatedOrder });

    } catch (error) {
        console.error(' Lỗi xử lý webhook:', error);
        res.status(500).json({ error: error.message });
    }
};

const createPaymentController = async (req, res) => {
    try {
        const userId = req.user.userId
        const cart = req.cart;
        const { newOrder, orderCode } = await createOrderService(userId, cart);
        const paymentLink = await createPaymentLinkService(orderCode, newOrder.totalAmount);

        res.redirect(paymentLink);
    } catch (error) {
        console.error(' Lỗi tạo thanh toán:', error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getProductsController, postAddProduct, getAddProductPage,
    logoutController, getAddProductPage, getEditProductPage, getProductCollectionController,
    createProductController, addToCartController, deleteProductController, editProductController,
    getCartController, removeFromCartController, getProductDetailController, createPaymentController,
    receiveWebhookController

}
