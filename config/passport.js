// const { Strategy, ExtractJwt } = require('passport-jwt');
// const User = require('../models/user'); // Mô hình người dùng
// const jwtSecret = 'kit secret'; // Mã bí mật để tạo JWT

// module.exports = (passport) => {
//     const opts = {
//         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy JWT từ header Authorization
//         secretOrKey: jwtSecret, // Mã bí mật để giải mã token
//     };

//     passport.use(
//         new Strategy(opts, async (jwt_payload, done) => {
//             try {
//                 const user = await User.findById(jwt_payload.id);
//                 if (!user) {
//                     return done(null, false); // Không tìm thấy người dùng
//                 }
//                 return done(null, user); // Trả người dùng đã xác thực
//             } catch (err) {
//                 return done(err, false);
//             }
//         })
//     );
// };
