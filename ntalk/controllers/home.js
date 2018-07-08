module.exports = function(app){

	var Usuario = app.models.usuario;
	
	var HomeController = {
		index: function(req, res, next){
			res.render('home/index');
		},
		login: function(req, res, next){

			var query = {email: req.body.usuario.email};
			// var email = req.body.usuario.email;
			// var nome = req.body.usuario.nome;

			Usuario.findOne(query)
				.select('nome email')
				.exec(function(erro, usuario){

					if(usuario){
						req.session.usuario = usuario;
						res.redirect('/contatos');
					}else{
						Usuario.create(req.body.usuario,function(erro,usuario){
							if(erro){
								res.redirect('/');
							}else{
								req.session.usuario = usuario;
								res.redirect('/contatos');
							}
						});
					}
				});

			// if(email && nome){
			// 	var usuario = req.body.usuario;
			// 	usuario['contatos'] = [];
			// 	req.session.usuario = usuario;
			// 	res.redirect('/contatos');

			// }else{
			// 	res.redirect('/');
			// }

		},
		logout: function(req, res, next){
			req.session.destroy();
			res.redirect('/');
		}
	}

	return HomeController;
};