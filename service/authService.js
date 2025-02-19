const User = require('../models/user');

require("dotenv").config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const saltRounds = 10

const createUserService = async (username, password) => {
    try {
        if (password.length < 6) {
            return { success: false, error: new Error('Minimum password length is 6 characters') };
        }
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // Tạo instance của User
        const newUser = new User({
            username,
            password: hashPassword,
            role: 'user',
        });

        // Ép Mongoose chạy validation đầy đủ
        await newUser.validate();

        // Lưu vào DB
        await newUser.save();

        return { success: true, data: newUser };
    } catch (error) {
        return { success: false, error };
    }
};

const loginUserService = async (username, password) => {
    const user = await User.findOne({ username });
    if (user) {
        const isMatchPassword = bcrypt.compareSync(password, user.password)
        if (!isMatchPassword) {
            return {
                EC: 2,
                EM: "Email/Password not valid"
            }
        } else {
            //create access token
            const payload = {
                username: user.username,
                role: user.role
            }
            const access_token = jwt.sign(
                payload,
                process.env.JWT_SECRECT,
                {
                    expiresIn: process.env.JWT_EXPIRE
                }
            )
            return {
                access_token,
                user: {
                    username: user.username,
                    role: user.role

                }
            }
        }

    } else {
        return {
            EC: 1,
            EM: "Email/Password not valid"
        }
    }


};
const getUserService = async () => {
    try {

        let result = await User.find({}).select('-password')
        return result;

    } catch (error) {
        console.log(error)
        return null
    }
}

module.exports = { getUserService, loginUserService, createUserService };
