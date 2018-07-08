module.exports = function(app){
	var ChatController = {
		index: function(req, res, next){
			var sala = req.params.sala;

			var params = {email: req.params.email,
						sala: sala};
			res.render('chat/index', params);
		}
	};

	return ChatController;
};