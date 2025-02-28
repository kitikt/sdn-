const multer = require('multer');
const path = require('path');

// Cấu hình lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Lưu file vào thư mục public/uploads
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất, giữ nguyên phần mở rộng
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Lọc file: chỉ cho phép các file ảnh
function fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Chỉ cho phép upload file hình ảnh!'), false);
    }
    cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
