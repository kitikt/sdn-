const express = require('express');
const { getProductsController, logoutController } = require('../controller/shopController');

const authOptional = require('../middleware/authOptional');
const router = express.Router();

router.get('/logout', logoutController)
router.get('/', authOptional, getProductsController);
module.exports = router