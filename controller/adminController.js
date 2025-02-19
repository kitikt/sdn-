// controller/adminController.js

const { getUserById } = require("../service/adminService");
const { deleteUserService } = require("../service/adminService");
const { updateUserService } = require("../service/adminService");
const { getAllUsersAdmin } = require("../service/adminService");
const { createUserByAdmin } = require("../service/adminService");


const getAllUser = async (req, res) => {
    try {
        const users = await getAllUsersAdmin();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getUserDetail = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const createUserAdmin = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const newUser = await createUserByAdmin({ username, password, role });
        return res.status(201).json({
            message: 'User created successfully',
            data: { username: newUser.username, role: newUser.role },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const updatedUser = await updateUserService(req.params.id, req.body);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const deletedUser = await deleteUserService(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
module.exports = { getAllUser, getUserDetail, createUserAdmin, updateUser, deleteUser }