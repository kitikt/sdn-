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
module.exports = { getAllProducts, createProductService }