const User = require('../models/user');
require("dotenv").config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const saltRounds = 10


const createUserService = async (username, password) => {
    try {
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({
            username: username,
            password: hashPassword,
            role: "user"
        });
        // Thành công => trả về object
        return { success: true, data: newUser };
    } catch (error) {
        // Thất bại => trả về object có error
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
                username: username
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
                    username: user.username
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
