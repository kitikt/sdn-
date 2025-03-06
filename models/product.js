const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 20

    },
    description: {
        type: String,


    },
    price: {
        type: Number,

        min: 0,


    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: {
        type: String
    }

});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;