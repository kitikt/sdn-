const auth = require('./auth');

const authOptional = (req, res, next) => {
    // Kiểm tra xem có token không
    let token = req.cookies.access_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) {
        // Nếu không có token, gán null cho user và tiếp tục
        req.user = null;
        res.locals.user = null;
        return next();
    }
    // Nếu có token, gọi middleware auth để xử lý
    return auth(req, res, next);
};

module.exports = authOptional;
