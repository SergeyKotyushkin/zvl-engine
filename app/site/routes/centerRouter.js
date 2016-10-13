function init(router) {
	var authenticator = require('../tools/authenticator');
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");

	router.get('/:culture/center', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			res.redirect(['/', req.params.culture].join(''));
			return;
		}

		// load user data
		userModel.findOne({ _id: req.user._id }, function(err, user) {
			if(err || !user) {
				authenticator.logout(res);
				res.redirect(['/', req.params.culture].join(''));
				return;
			}

			// load near game
			var nearGames = [
				{id: 1, name: 'fgame', date: '10.09.2016', status: 0},
				{id: 2, name: 'sgame', date: '11.09.2015', status: 1},
				{id: 3, name: 'tgame', date: '12.09.2017', status: 2}
			];

			res.render('center', {
				renderModel: {
					settings: settings.default(req),
					layoutAuthRenderModel: {
						user: {
							username: user.username,
							email: user.email
						},
						title: "center"
					},
					carousel: {
						slides: [
							{src: '/img/center-carousel/nature.jpg', caption: 'Nature', description: 'first'}//,
							//{src: 'https://placeimg.com/1000/300/tech', caption: 'Fashion', description: 'second'},
							//{src: 'https://placeimg.com/1000/300/sepia', caption: 'Sport', description: 'third'}
						]
					},
					nearGames: nearGames
				}
			});
		});
	});
}

module.exports = { init: init };
