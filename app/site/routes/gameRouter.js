function init(router) {
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
			message: settings.parseError(req, err, 'creator'),
			success: false
		});
	}

	router.get('/:culture/game', function (req, res, next) {
		if (!constants.labels.hasCulture(req.params.culture)) {
			res.redirect(['/', constants.settings.common.defaultCulture, '/creator'].join(''));
			return;
		}

		if(!req.user.isAuthenticated) {
			return handleLogoutError(res);
		}

		if(!req.query.id) {
			res.redirect('/' + req.params.culture + 'center');
			return;
		}

		var labels = settings.default(req).labels;

		gameModel.findById(req.query.id, function(err, gameResult) {
			if(err) {
				return handleLogoutError(res);
			}

			if(!gameResult) {
				res.redirect('/' + req.params.culture + 'center');
				return;
			}

			var game = JSON.parse(JSON.stringify(gameResult));

			var renderModel = {
				labels: {
					messages: labels.messages,
					game: labels.pages.game,
					layoutAuth: labels.pages.layoutAuth
				},
				username: req.user.username || 'someone',
				name: game.name,
				level: game.levels[0],
				sectors: []
			};

			res.render('game', { renderModel: renderModel });
		});
	});

	// ajax post requests
	router.post('/creator/create', function (req, res, next) {
		var labels = settings.default(req).labels;

		if(!req.user.isAdmin) {
			return handleJsonError(req, res, labels.pages.creator.messages.onlyAdmin)
		}

		var game = req.body.game;
		game.creatorId = req.user._id;

		var id = game.id;

		delete game.layoutAuthViewModel;
		delete game.header;
		delete game.teams;
		delete game.id;

		if(!id){
			gameModel.create(game, function(err, game) {
				if(err || !game) {
					return handleJsonError(req, res, err);
				}

				res.json({
					success: true,
					message: labels.pages.creator.messages.gameWasCreated,
					location: 'creator?id=' + game._id.toString()
				});
			})
		} else {
			gameModel.findOneAndUpdate({_id: id}, game, function(err, game) {
				if(err || !game) {
					return handleJsonError(req, res, err);
				}

				res.json({
					success: true,
					message: labels.pages.creator.messages.gameWasUpdated,
					location: 'creator?id=' + game._id.toString()
				});
			})
		}
	});
}

module.exports = { init: init };
