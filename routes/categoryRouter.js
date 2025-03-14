const express = require('express');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, isAdmin, async (req, res) => {
    console.log('check user id', req.user.userId)
    try {
        const newCategory = new Category({
            ...req.body,
            createdBy: [req.user.userId]
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', auth, isAdmin, async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json(updatedCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
