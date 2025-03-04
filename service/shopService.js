const Product = require('../models/product');
const Category = require('../models/category');

const getAllProducts = async () => {
    return await Product.find().populate('categoryId', 'name');
};
const createProductService = async (req, res) => {
    try {
        // Kiểm tra xem danh mục có tồn tại không
        const category = await Category.findById(req.body.categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Tạo dữ liệu sản phẩm từ req.body
        let productData = req.body;
        if (req.file) {
            // Nếu có file upload, lưu đường dẫn file ảnh
            productData.image = '/uploads/' + req.file.filename;
        }

        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();

        // Cập nhật category để chứa sản phẩm này
        await Category.findByIdAndUpdate(req.body.categoryId, { $push: { products: savedProduct._id } });

        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
const getCartService = (session) => {
    return session.cart || [];
};
const getProductByIdService = async (productId) => {
    try {
        const product = await Product.findById(productId);
        return product;
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error; // Ném lỗi để controller xử lý
    }
};

const addCartService = (session, { productId, name, price, image }) => {
    if (!session.cart) {
        session.cart = [];
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
        console.error(`Giá không hợp lệ cho sản phẩm ${productId}: ${price}`);
        return session.cart;
    }
    const existingProduct = session.cart.find(p => p.productId === productId);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        session.cart.push({ productId, name, price: priceNum, image, quantity: 1 });
    }
    return session.cart;
};
const removeCartService = (session, productId) => {
    session.cart = session.cart.filter(product => product.productId !== productId);
    return session.cart;
};
const deleteProductAdminService = async (productId) => {
    return await Product.findByIdAndDelete(productId);
};
const editProductAdminService = async (productId, updatedData) => {
    return await Product.findByIdAndUpdate(productId, updatedData, { new: true });
};

const getTotalPriceService = (cart) => {
    return cart.reduce((total, product) => total + product.price * product.quantity, 0);
};

module.exports = { getAllProducts, deleteProductAdminService, createProductService, editProductAdminService, removeCartService, getTotalPriceService, getCartService, addCartService, getProductByIdService }