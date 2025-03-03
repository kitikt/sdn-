const { getAllProducts, createProductService, getCartService, getTotalPriceService, addCartService, removeCartService } = require("../service/shopService");



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
        res.clearCookie('access_token'); //xóa cookie access token
        req.session.destroy((err) => {
            if (err) {
                console.log('Lỗi khi hủy phiên:', err);
                return res.redirect('/'); // Chuyển hướng về trang chủ nếu có lỗi
            }
            // Xóa cookie phiên
            // Sau khi xóa session và cookie, chuyển hướng về trang chủ hoặc trang login
            res.redirect('/'); // Hoặc bạn có thể chuyển hướng tới trang login nếu cần
        });
    } else {
        res.redirect('/'); // Nếu không có session, chuyển hướng về trang chủ
    }
};

const getCartController = (req, res, next) => {
    req.cart = getCartService(req.session);
    console.log("Cart data:", req.cart);
    req.totalPrice = getTotalPriceService(req.cart);
    next();
};

const addToCartController = (req, res, next) => {
    console.log("Received data:", req.body); // Kiểm tra dữ liệu khi gửi lên

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
    next(); // Tiếp tục middleware
};
module.exports = { getProductsController, logoutController, createProductController, addToCartController, getCartController, removeFromCartController }
