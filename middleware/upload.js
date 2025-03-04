const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Lưu file vào thư mục này
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

function fileFilter(req, file, cb) {
    console.log("🔎 Checking file:", file); // Log file để kiểm tra
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('❌ Chỉ cho phép upload file hình ảnh!'), false);
    }
    cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
