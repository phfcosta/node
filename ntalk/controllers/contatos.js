module.exports = function(app){

	var Usuario = app.models.usuario;

	var ContatoController  = {
		index: function(req, res, next){
			
			// var usuario = req.session.usuario;
			// var contatos = usuario.contatos;
			// var params = {usuario: usuario,
			// 				contatos: contatos};

			// res.render('contatos/index',params);
			var _id = req.session.usuario._id;

			Usuario.findById(_id,function(erro,usuario){
				var contatos = usuario.contatos;
				var resultado = {contatos: contatos};
				res.render('contatos/index',resultado);
			});

		},
		create: function(req, res, next){
			// var contato = req.body.contato;
			// var usuario = req.session.usuario;
			// usuario.contatos.push(contato);
			// res.redirect('/contatos')
			var _id = req.session.usuario._id;

			console.log('id ' + _id);

			Usuario.findById(_id,function(erro,usuario){

				if(erro){
					console.log('deu erro ' + erro);
				}

				console.log('usuario:' + usuario);

				var contato = req.body.contato;
				var contatos = usuario.contatos;

				console.log('contato ' + contato);

				usuario.contatos.push(contato);
				usuario.save(function(){
					res.redirect('/contatos');
				});
			});
		},
		show: function(req, res, next){
			// var id = req.params.id;
			// var contato =  req.session.usuario.contatos[id];
			// var params = {contato: contato,
			// 				id:id};
			// res.render('contatos/show',params);
			var _id = req.session.usuario._id;

			Usuario.findById(_id,function(erro,usuario){
				var contatoID = req.params.id;
				var contato = usuario.contato.id(contatoID);
				var resultado = {contato: contato};
				res.render('contatos/show',resultado);

			});

		},
		edit: function(req, res, next){
			// var id = req.params.id;
			// var usuario = req.session.usuario;
			// var contato = usuario.contatos[id];
			// var params = {usuario: usuario,
			// 				contatos: contato,
			// 				id: id};

			// res.render('contatos/edit',params);
			var _id = req.session.usuario._id;

			Usuario.findById(_id,function(erro,usuario){
				var contatoID = req.params.id;
				var contato = usuario.contato.id(contatoID);
				var resultado = {contato: contato};
				res.render('contatos/edit',resultado);

			});
		},
		update: function(req, res, next){
			// var contato = req.body.contato;
			// var usuario = req.session.usuario;
			// usuario.contatos[req.params.id] = contato;
			// res.redirect('/contatos')
			var _id = req.session.usuario._id;

			Usuario.findById(_id,function(erro,usuario){
				var contatoID = req.params.id;
				var contato = usuario.contato.id(contatoID);
				contato.nome = req.body.contato.nome;
				contato.email =  req.body.contato.email;
				usuario.save(function(){
					res.redirect('/contatos');
				});

			});
		},
		destroy: function(req, res, next){
			// var usuario = req.session.usuario;
			// var id = req.params.id;
			// usuario.contatos.splice(id,1);
			// res.redirect('/contatos');
			var _id = req.session.usuario._id;

			Usuario.findById(_id,function(erro,usuario){
				var contatoID = req.params.id;
				usuario.contato.id(contatoID).remove();
				usuario.save(function(){
					res.redirect('/contatos');
				});

			});
		}
	}

	return ContatoController;
}