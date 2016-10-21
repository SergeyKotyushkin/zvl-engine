function init(router) {
	var authenticator = require('../tools/authenticator');
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");
	var gameModel = require(__common + "/models/game");
	var moment = require('moment');

	function handleLogoutError(res) {
		authenticator.logout(res);
		res.redirect('/');
	}

	function handleJsonError(req, res, err) {
		res.json({
			message: settings.parseError(req, err, 'account'),
			success: false
		});
	}

	function handleJsonError(req, res, err) {
		res.json({
			message: settings.parseError(req, err, 'center'),
			success: false
		});
	}

	function getNearGames(userId, callback) {
		gameModel
			.find({active: true}, '_id name timeStartNumber teams', {sort: {timeStartNumber: -1}})
			.populate('teams', 'userIds')
			.exec(function(err, games) {
				if(err || !games) {
					return callback(err, []);
				}

				var nearGames = [];
				for (var i = 0; i < games.length; i++) {
					var isUserInGame = false;
					for (var j = 0; j < games[i].teams.length; j++) {
						isUserInGame = games[i].teams[j].userIds.indexOf(userId) > -1;
						if(isUserInGame) break;
					}
					var timeStart = new Date(games[i].timeStartNumber);

					nearGames.push({
						id: games[i]._id,
						name: games[i].name,
						date: moment(timeStart).format("YYYY-MM-DD HH:mm:ss"),
						status: isUserInGame ? 1 : 2
					})
				}

				return callback(null, nearGames);
			});
	}


	router.get('/:culture/center', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			return handleLogoutError(res);
		}

		// load user data
		userModel.findOne({ _id: req.user._id }, function(err, user) {
			if(err || !user) {
				return handleJsonError(req, res, err);
			}

			// load near game
			getNearGames(req.user._id, function(err, games) {
				if(err) {
					return handleLogoutError(res);
				}

				var labels = settings.default(req).labels;
				res.render('center', {
					renderModel: {
						labels: {
							messages: labels.messages,
							center: labels.pages.center,
							layoutAuth: labels.pages.layoutAuth
						},
						layoutAuthRenderModel: {
							user: {
								username: user.username,
								email: user.email
							}
						},
						carousel: {
							slides: [
								{src: '/img/center-carousel/nature.jpg', caption: 'Nature', description: 'first'}//,
								//{src: 'https://placeimg.com/1000/300/tech', caption: 'Fashion', description: 'second'},
								//{src: 'https://placeimg.com/1000/300/sepia', caption: 'Sport', description: 'third'}
							]
						},
						nearGames: games,
						culture: req.params.culture
					}
				});
			});
		});
	});
}

module.exports = { init: init };
