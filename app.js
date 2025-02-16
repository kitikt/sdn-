var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var passport = require('passport')
// require('./config/passport')(passport);
var indexRouter = require('./routes/index');
var aboutRouter = require('./routes/aboutUs');
var contactRouter = require('./routes/contact');
var productRouter = require('./routes/productRouter');
var categoryRouter = require('./routes/categoryRouter');
var authRouter = require('./routes/authRouter');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(passport.initialize()); // Khởi tạo Passport
// 👉 **Định nghĩa route /set-cookies TRƯỚC middleware xử lý lỗi 404**
// app.get('/set-cookies', (req, res) => {
//   res.cookie('newUser', true, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
//   res.send('✅ Cookie has been set successfully!');
// });

// Sử dụng các router
app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/contact', contactRouter);
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/v1', authRouter);

// ❌ Middleware xử lý lỗi 404 - phải đặt SAU tất cả route
app.use(function (req, res, next) {
  next(createError(404));
});

// ❌ Middleware xử lý lỗi chung - phải đặt cuối cùng
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// Khởi động server
var http = require('http');
const connection = require('./config/database');
var port = 3009;
app.set('port', port);

var server = http.createServer(app);
connection();
server.listen(port, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
