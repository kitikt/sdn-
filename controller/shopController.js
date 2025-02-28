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

module.exports = { getProductsController }
