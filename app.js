var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var passport = require('passport')
// require('./config/passport')(passport);
// var productRouter = require('./routes/productRouter');
// var categoryRouter = require('./routes/categoryRouter');
var session = require('express-session')
var swaggerUi = require('swagger-ui-express');
var swaggerSpec = require('./config/swagger');
var shopRouter = require('./routes/shopRouter')
require('dotenv').config();

var app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// View engine setupw
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Đặt secure: true nếu dùng HTTPS
}));
app.use('/category', require('./routes/categoryRouter'));
app.use('/product', require('./routes/productRouter'));
app.use('/v1', require('./routes/authRouter'));
app.use(shopRouter)


app.use(function (req, res, next) {
  next(createError(404));
});

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
  console.log(` Server đang chạy tại http://localhost:${port}`);
});
