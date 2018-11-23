var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var axisList;

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('room', function(room) {
    console.log(room);
      socket.join(room);
  });
  socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  socket.on('newtweet', function(msg){
      console.log(msg);
      io.in(msg.topic).emit('newtweet', msg);
    });
  socket.on('updatetweet', function(msg){
      console.log(msg);
      io.in(msg.topic).emit('updatetweet', msg);
    });
  socket.on('toggletwitter', function(msg){
      console.log(msg);
      io.in(msg.topic).emit('toggletwitter', msg);
    });
  socket.on('deletetweet', function(msg){
      console.log(msg);
      io.in(msg.topic).emit('deletetweet', msg);
    });
  socket.on('carouselnext', function(msg){
      console.log("carouselnext");
      io.in(msg.topic).emit('carouselnext', msg);
    });
  socket.on('carouselprev', function(msg){
      console.log("carouselprev");
      io.in(msg.topic).emit('carouselprev', msg);
    });
  socket.on('carouselcurrentreq', function(msg){
      io.in(msg.topic).emit('carouselcurrentreq', msg);
    });
  socket.on('carouselcurrentres', function(msg){
      io.in(msg.topic).emit('carouselcurrentres', msg);
    });
  socket.on('carouselmedia', function(msg){
      io.in(msg.topic).emit('carouselmedia', msg);
    });
  socket.on('carouselauto', function(msg){
      io.in(msg.topic).emit('carouselauto', msg);
    });
  socket.on('togglecontador', function(msg){
      io.in(msg.topic).emit('togglecontador', msg);
    });
  socket.on('count', function(msg){
    console.log('count');
      io.in(msg.topic).emit('count', msg);
    });
  socket.on('restart', function(msg) {
      axisList = null;
      io.in(msg.topic).emit('restart', msg);
  });
});

http.listen(9002, function(){
  console.log('listening on *:9002');
});

module.exports = app;
