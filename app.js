var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let helpers = require("handlebars-helpers")
let hbs = require('express-handlebars')
let session=require('express-session')
let fileUpload= require('express-fileupload');
var flash = require('connect-flash');

let db=require('./config/connection')

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var sampRouter = require('./routes/samp');
const HBS = hbs.create({});
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine("hbs",hbs.engine({helpers: {
  inc: function (value, options) {
    return parseInt(value) + 1;}},extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload())
app.use(express.static(path.join(__dirname, 'public')));


app.use((req,res,next)=>{
  if(!req.user){
    res.header('cache-control','private,no-cache,no-store,must revalidate')
    res.header('Express','-3')
  }
  next();
})

app.use(session({secret:"key",cookie:{}}))
app.use(flash());

db.connect((err)=>{
  if(err) console.log("fail"+err)
  else console.log("sucess");
})

HBS.handlebars.registerHelper("ifCompare", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/samp', sampRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //next(createError(404));
  res.render('user/pagenotfound',{notfound:true})
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500); 
  res.render('error');
});

module.exports = app;
