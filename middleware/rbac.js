// const roles = require('../utils/roles');

// const checkRole = (permission) => {
//     return (req, res, next) => {
//         if (!req.user || !roles[req.user.role]) {
//             return res.status(403).json({ message: "❌ Access denied" });
//         }

//         if (!roles[req.user.role].can.includes(permission)) {
//             return res.status(403).json({ message: "❌ Permission denied" });
//         }

//         next();
//     };
// };

// module.exports = checkRole;
