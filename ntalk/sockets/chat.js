module.exports =  function(io){
	var crypto = require('crypto')
	,	md5 = crypto.createHash('md5')
	,	redis = require('redis').createClient()
	,	sockets = io.sockets;
	var contador = 0;
	var salas = new Map();

	sockets.on('connection',function(client){

		var session = client.handshake.session;

		if(typeof session !== 'undefined'){
			usuario = session.usuario;
			console.log('pegando usuario da sessao ' + usuario.nome);
		}else{
			console.log('session is undefined');
		}
		
		//client.set('email',usuario.email);

		//var onlines = sockets.clients();
		//console.log(onlines);
		// onlines.forEach(function(online){
		// 	var online = sockets.socket[online.id];
		// 	online.get('email',function(err, email){
		// 		client.emit('notify-onlines',email);
		// 		client.broadcast.emit('notify-onlines',email);
		// 	});
		// });

		
		client.on('join',function(sala){

			console.log('client connection begin');
			if(!sala.trim()){
				if(salas.size > 0){
					sala = salas.get('sala');
				}
			}

			if(sala){
				console.log('connection already exist ' + sala);
				sala = sala.replace('?','');
			}else{

				if(salas.size > 0){
					sala = salas.get('sala');
				}
				var timestamp = new Date().toString();
				var md5 = crypto.createHash('md5');
				sala = md5.update(timestamp).digest('hex');
				console.log('sala does not exist. Creating sala ' + sala);
			}

			salas.set("sala", sala);
			session.sala = sala;

			console.log('session.sala ' + session.sala);
			client.join(sala);
			var msg = "<b>" + usuario.nome + "</b>: entrou na sala " + sala + "<br>" ;

			// redis.lpush(sala,msg,function(erro, res){
			// 	redis.lrange(sala, 0, -1,function(erro,msgs){
			// 		msgs.forEach(function(msg){
			// 			sockets.in(sala).emit('send-client',msg);
			// 		});
			// 	});

			// });

			redis.lrange(sala, 0, -1, function(erro, msgs) {
				msgs.forEach(function(msg) {
					client.emit('send-client', msg);
				});
				redis.rpush(sala, msg);
				sockets.in(sala).emit('send-client', msg);
			});
			console.log(msg);
			sockets.in(sala).emit('send-client', msg);
			io.of('/').in(sala).emit('send-client', msg);
			var countclients = io.of('/').in(sala).clients;
			console.log(JSON.stringify(countclients));

			console.log(sockets.adapter.rooms[sala]);
			sockets.emit('rooms', sockets.adapter.rooms[sala]);
			//var onlines = sockets.clients();
			//console.log(onlines);
			
			sockets.emit('send-client', msg);
			io.emit('send-client', msg);

		});

		client.on('send-server',function(msg){

			console.log('id da sessao ' + session.usuario._id);
			console.log('sessao send-server ' + JSON.stringify(session));

			var msg = "<b>" + session.usuario.nome + "</b>:" +msg + "<br>";

			var sala = salas.get('sala')
			,	data = {email: usuario.email, sala: sala};

			console.log('sala ' + sala + ' msg ' + msg);
			console.log(sockets.rooms);
			redis.rpush(sala,msg);
			client.broadcast.emit('new-message',data);
			sockets.in(sala).emit('send-client', msg);

			// var session = client.handshake.session;

			// console.log('id da sessao ' + session.id);

			// if(typeof session !== 'undefined'){
			// 	usuario = session.usuario;
			// 	console.log('pegando usuario da sessao ' + usuario.nome);
			// }else{
			// 	console.log('session is undefined');
			// }

			// console.log('client send a message');
			// var message = "<b>" + usuario.nome + ":</b>" + msg + "<br>";
			// console.log('message ' + message);

			// sala = salas.get('sala');

			// if (sala){
			// 	console.log('sala ' + sala);
			// 	var data = {email: usuario.email, sala: sala};
			// 	client.broadcast.emit('new-message',data);
			// 	sockets.in(sala).emit('send-client', message);
			//	}



			// salas.get('sala',function(erro,sala){
			// 	console.log('sala ' + sala);
			// 	var data = {email: usuario.email, sala: sala};
			// 	client.broadcast.emit('new-message',data);
			// 	sockets.in(sala).emit('send-client', message);
			// });

		});


		client.on('disconnect', function(){

			var sala = session.sala
			,	msg = "<b>" + usuario.nome + "</b>: saiu";

			redis.rpush(sala, msg);
			client.broadcast.emit('notify-online',usuario.email);
			sockets.in(sala).emit('send-client',msg);
			redis.srem('onlines', usuario.email);
			client.leave(sala);


			// console.log('disconnect ' + client);

			// if(client === 'undefined'){
			// 	console.log('client is undefined');
			// }

			// salas.get('sala',function(erro,sala){
			// 	var msg = "<b>" + usuario.nome + ":</b> saiu<br>";
			// 	client.broadcast.emit('notify-online',usuario.email);
			// 	sockets.in(sala).emit('send-client',msg);
			// 	client.leave(sala);
			// });
		});

	});
}