var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var favicon = require('serve-favicon') //favicon 설정

var indexRouter = require('./routes/index');
var emoticstudioRouter = require('./routes/studio');
var mystudioRouter = require('./routes/mystudio');
var walletRouter = require('./routes/wallet');
var managementRouter = require('./routes/management');

var app = express();
var connect = require('./schemas');
connect();

app.set('port', process.env.PORT || 8001);
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(cors()); 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.unsubscribe(favicon(path.join)) //favicon 설정

app.use('/', indexRouter);
app.use('/', emoticstudioRouter);
app.use('/mystudio', mystudioRouter);
app.use('/mystudio', walletRouter);
app.use('/mystudio', managementRouter);

//404처리 미들웨어
app.use((req,res,next)=>{
    const err = new Error('NOT FOUND');
    err.status = 404;
    next(err);
});
//에러 핸들러
app.use((err,req,res)=>{
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development'?err:{};
    res.status(err.status || 500);
    console.log(error);
    res.render('error');
});
app.listen(app.get('port'),()=>{
  console.log(app.get('port'),'번 포트가 실행 중 입니다.');
})

module.exports = app;
