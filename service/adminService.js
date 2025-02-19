// service/adminService.js
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Lấy danh sách tất cả user (ẩn password)
const getAllUsersAdmin = async () => {
    const users = await User.find({}).select('-password');
    return users;

};

// Lấy thông tin chi tiết của 1 user theo id
const getUserById = async (id) => {
    const user = await User.findById(id).select('-password');
    return user;
};

// Tạo user mới (admin tạo)
const createUserByAdmin = async ({ username, password, role }) => {
    if (!username || !password) {
        throw new Error("Username and password are required");
    }
    if (password.length < 6) {
        throw new Error("Minimum password length is 6 characters");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        password: hashPassword,
        role: role || 'user',
    });
    await newUser.save();
    return newUser;
};

// Cập nhật user theo id
const updateUserService = async (id, updateData) => {
    if (updateData.password && updateData.password.length < 6) {
        throw new Error("Minimum password length is 6 characters");
    }
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    return updatedUser;
};

// Xóa user theo id
const deleteUserService = async (id) => {
    const deletedUser = await User.findByIdAndDelete(id);
    return deletedUser;
};

module.exports = {
    getAllUsersAdmin,
    getUserById,
    createUserByAdmin,
    updateUserService,
    deleteUserService,
};
