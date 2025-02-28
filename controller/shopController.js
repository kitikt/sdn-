const { getAllProducts } = require("../service/shopService");



const getProductsController = async (req, res) => {
    try {
        const products = await getAllProducts();
        // Render view sản phẩm (EJS)
        res.render('product', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    } catch (err) {
        console.log(err);
        next(err);
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


module.exports = { getProductsController, logoutController }
