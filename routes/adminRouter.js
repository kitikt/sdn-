const router = express.Router();
const express = require('express');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { getAllUser } = require('../controller/adminController');

router.get('/user', auth, isAdmin, getAllUser);
// router.post()
/**
 * @swagger
 * /v1/user/{id}:
 *   get:
 *     summary: (Admin) Lấy thông tin chi tiết của 1 user theo ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Thông tin chi tiết user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
