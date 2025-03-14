const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');
const PayOS = require('@payos/node');
const crypto = require('crypto');
const payos = new PayOS('eb71496f-4f26-4596-94d3-62a14767de2d',
    'a57c56e3-7de6-41b5-b5ae-9a09b658274e',
    'e941bb692c2efeb129ffab3d6226cbc196b187e31bfce2e5ba156cbb6ea93cfa')
const CHECKSUM_KEY = "e941bb692c2efeb129ffab3d6226cbc196b187e31bfce2e5ba156cbb6ea93cfa"; // Dùng CHECKSUM_KEY của PayOS

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
const createOrderService = async (userId, cart) => {
    if (!userId || !cart || cart.length === 0) {
        throw new Error('Thiếu thông tin đơn hàng');
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderCode = Math.floor(100000 + Math.random() * 900000);

    const newOrder = new Order({
        userId,
        products: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        totalAmount,
        status: 'PENDING'
    });

    await newOrder.save();
    return { newOrder, orderCode };
};

// Tạo link thanh toán từ PayOS
const createPaymentLinkService = async (orderCode, totalAmount) => {
    const order = {
        amount: totalAmount * 25000,
        description: `Đơn hàng #${orderCode}`.slice(0, 25),
        orderCode: orderCode,
        returnUrl: 'http://localhost:3009/success',
        cancelUrl: 'http://localhost:3009/cancel',
    };

    const response = await payos.createPaymentLink(order);
    if (!response || !response.checkoutUrl) {
        throw new Error('Không thể tạo link thanh toán');
    }
    return response.checkoutUrl;
};
const verifySignature = (data, signature) => {
    try {
        // Chuyển đổi dữ liệu về dạng string theo đúng chuẩn PayOS
        const sortedData = Object.keys(data)
            .sort()
            .map(key => `${key}=${data[key]}`)
            .join("&");

        console.log("🔹 Dữ liệu sau khi chuẩn hóa:", sortedData);

        const computedSignature = crypto
            .createHmac('sha256', CHECKSUM_KEY)
            .update(sortedData)
            .digest('hex');

        console.log("🔹 Chữ ký tính toán được:", computedSignature);
        console.log("🔹 Chữ ký từ webhook:", signature);

        return computedSignature === signature;
    } catch (error) {
        console.error("❌ Lỗi khi kiểm tra chữ ký:", error);
        return false;
    }
};

const handleWebhookService = async (webhookData) => {
    try {

        const { data } = webhookData;
        const { orderCode, amount, transactionDateTime, counterAccountName, counterAccountNumber } = data;

        // Tìm đơn hàng có `totalAmount` khớp với số tiền nhận được
        const order = await Order.findOne({ totalAmount: amount / 25000, status: "PENDING" });

        if (!order) {
            console.log("⚠️ Không tìm thấy đơn hàng cần cập nhật!");
            return { success: false, message: "Order not found" };
        }

        // Cập nhật trạng thái đơn hàng
        order.status = "PAID";
        order.paidAt = transactionDateTime;
        order.payerName = counterAccountName || "Unknown";
        order.payerAccount = counterAccountNumber || "Unknown";
        order.amountPaid = amount;

        await order.save();

        console.log(" Đơn hàng đã được cập nhật thành PAID:", order);
        return { success: true, order };
    } catch (error) {
        console.error(" Lỗi khi cập nhật đơn hàng:", error);
        return { success: false, message: "Server error" };
    }
};

module.exports = {
    getAllProducts, deleteProductAdminService, createProductService, editProductAdminService,
    removeCartService, getTotalPriceService, getCartService,
    addCartService, createOrderService, createPaymentLinkService, handleWebhookService, getProductByIdService, verifySignature
}