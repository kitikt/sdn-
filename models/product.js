const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 10

    },
    description: {
        type: String,


    },
    price: {
        type: Number,

        min: 0,
        max: 99

    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;