process.env.NODE_ENV = 'development';

const KEY = 'ntalk.sid', SECRET = 'ntalk', REDIS='ntalk', MAX_AGE={maxAge: 3600000};

var express = require('express');
var load = require('express-load');
var error = require('./middleware/error');
var compression = require('compression');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var mongoose = require('mongoose');
var redisAdapter = require('socket.io-redis');
var RedisStore = require('connect-redis')(expressSession);
var logger = require('morgan');

const util = require('util')

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var cookie = cookieParser(SECRET);
//var storeOpts = {client: redis.getClient(), prefix: KEY};
//var store = new expressSession.MemoryStore();
// var store = new ExpressStore(storeOpts);
// var sessOpts = {secret: SECRET, key: KEY, store: store};
// var session = express.session(sessOpts);
var store = new RedisStore({prefix: KEY});

//global.db = mongoose.connect('mongodb://localhost/ntalk');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(compression());
app.use(cookie);
app.use(expressSession({
	secret: SECRET,
	name: KEY,
	resave: false,
	saveUninitialized: false,
	store: store
}));
app.use(bodyParser());
app.use(methodOverride());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public'),MAX_AGE));

// store.length(function(tamanho){

// 	console.log("tamanho store " + tamanho);

// });

// store.all(function(sessions){

// 	console.log("sessao " + sessions);

// });

// io.set('authorization', function(data, accept){
// 	console.log('data:' + data);
// 	console.log('accept:' + accept);
// 	cookie(data,{},function(err){

// 		if (!err){
// 			var sessionId = data.signedCookies[KEY];

// 			console.log('sessionId :' + sessionId);

// 			store.get(sessionId, function(err,session){
// 				if(err || !session){
// 					accept(null,false);
// 				}else{
// 					data.session = session;
// 					accept(null,true);
// 				}
// 			});

// 		}

// 	});
// });
//io.adapter(redisAdapter());
io.set('log level',1);
io.use(function(socket, next){
	var data = socket.request;
	cookie(data,{},function(err){

		var sessionID = data.signedCookies[KEY];
		console.log('sessionID ' + sessionID);

		store.get(sessionID, function(err,session){

			if(err || !session){
				console.log('acesso negado teste');
				return next(new Error('Acesso negado!!!'))
			//	return next();
			}else{
				console.log('accesso liberado');
				socket.handshake.session = session;
				return next();
			}
		});



	});
});

// io.use(function(socket, next) {
// 	var data = socket.request;
// 	cookie(data, {}, function(err) {
// 		var sessionID = data.signedCookies[KEY];
// 		store.get(sessionID, function(err, session) {
// 			if (err || !session) {
// 				console.log('acesso negado');
// 				return next(new Error('Acesso negado!'));
// 			} else {
// 				console.log('acesso liberado');
// 				socket.handshake.session = session;
// 				return next();
// 			}
// 		});
// 	});
// });

load('models')
.then('controllers')
.then('routes')
.into(app);
load('sockets')
.into(io);



//app.use(error.notfound);
//app.use(error.serverError);
//app.use('/', routes);
//app.use('/usuarios', users);

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
//  app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
 //   res.render('error', {
//      message: err.message,
//      error: err
//    });
//  });
//}

// production error handler
// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//  res.status(err.status || 500);
//  res.render('error', {
//    message: err.message,
//    error: {}
//  });
//});

server.listen(3000, function(){
	console.log("Ntalk no ar");
});

module.exports = app;