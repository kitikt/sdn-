const isAdmin = (req, res, next) => {
    console.log("🔹 Checking Admin Role:", req.user);

    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: " Access denied: Only admin can access this" });
    }
    next();
};

module.exports = isAdmin;
