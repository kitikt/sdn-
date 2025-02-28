const express = require('express');
const Product = require('../models/product');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: API quản lý sản phẩm
 */

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: Trả về danh sách sản phẩm
 */
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate("categoryId", "name");
        return res.render('product', { prods: products, path: '/products' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Lấy sản phẩm theo ID
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Trả về thông tin sản phẩm
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Thêm sản phẩm mới
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "iPhone 14"
 *               categoryId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       201:
 *         description: Sản phẩm được thêm thành công
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
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
});


/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Cập nhật thông tin sản phẩm
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Samsung Galaxy S22"
 *               categoryId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Sản phẩm đã được cập nhật
 */
router.put('/:id', auth, async (req, res) => {
    try {
        const { categoryId } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Nếu category thay đổi, cập nhật danh mục sản phẩm
        if (categoryId && product.categoryId.toString() !== categoryId) {
            await Category.findByIdAndUpdate(product.categoryId, { $pull: { products: product._id } });
            await Category.findByIdAndUpdate(categoryId, { $push: { products: product._id } });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * 
 * /product/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm đã bị xóa
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Xóa sản phẩm khỏi danh mục chứa nó
        if (deletedProduct.categoryId) {
            await Category.findByIdAndUpdate(deletedProduct.categoryId, { $pull: { products: deletedProduct._id } }, { new: true });
        }

        return res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
