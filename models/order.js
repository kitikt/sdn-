const mongoose = require("mongoose")
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    paidAt: { type: Date },
    createdAt: { type: Date, default: Date.now }


})
const Order = mongoose.model('Order', orderSchema);
module.exports = Order
