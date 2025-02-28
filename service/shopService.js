const Product = require('../models/product');
const Category = require('../models/category');

const getAllProducts = async () => {
    return await Product.find().populate('categoryId', 'name');
};
module.exports = { getAllProducts }