const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true,
        minlength: [6, 'Minimum username length is 6 characters'],
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    refreshTokens: [{ type: String }]
});

// userSchema.pre('save', async function (next) {
//     if (this.isModified('password') || this.isNew) {
//         this.password = await bcrypt.hash(this.password, 10); // Hash password
//     }
//     next();
// });

const User = mongoose.model('User', userSchema);
module.exports = User;
