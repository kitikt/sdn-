const express = require('express');
const Product = require('../models/product');
const Category = require('../models/category');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate("categoryId", "name");
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {

    try {
        const product = await Product.findById(req.params.id)
        res.status(200).json(product);

    } catch (err) {
        res.status(500).json({ error: err.message });

    }
})
router.post('/', async (req, res) => {
    try {
        const categoryId = await Category.findById(req.body.categoryId)
        if (categoryId === null) {
            res.status(404).json({ error: "category does not exist" })
        }

        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();

        await Category.findByIdAndUpdate(req.body.categoryId, { $push: { products: newProduct._id } })
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { categoryId } = req.body;
    const product = await Product.findById(req.params.id);


    try {
        const productCategoryId = await Category.findById(categoryId)
        if (productCategoryId === categoryId) {

        }

        if (product.categoryId.toString() !== categoryId) {
            await Category.findByIdAndUpdate(product.categoryId, { $pull: { products: product._id } })
            await Category.findByIdAndUpdate(categoryId, { $push: { products: product._id } })

        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, categoryId },
            { new: true }

        );
        res.status(200).json({ message: 'Update product success', product: updatedProduct });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (deletedProduct.categoryId) {
            await Category.findByIdAndUpdate(deletedProduct.categoryId, {
                $pull: { products: deletedProduct._id }
            }, { new: true });
        }

        return res.status(200).json({ message: 'Delete product success', product: deletedProduct });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
