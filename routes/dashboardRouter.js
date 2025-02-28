const express = require('express');
const { getProductsController } = require('../controller/shopController');

const authOptional = require('../middleware/authOptional');
const router = express.Router();


router.get('/', authOptional, getProductsController);
module.exports = router