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

	router.get('/:culture/creator', function (req, res, next) {
		if (!constants.labels.hasCulture(req.params.culture)) {
			res.redirect(['/', constants.settings.common.defaultCulture, '/creator'].join(''));
			return;
		}

		if(!req.user.isAdmin) {
			res.writeHead(303, { Location : req.headers.referer });
			res.end();
			return;
		}

		var labels = settings.default(req).labels;

		gameModel.findById(req.query.id, function(err, game) {
			if(err) {
				return handleLogoutError(res);
			}

			var renderModel = {
				labels: {
					messages: labels.messages,
					creator: labels.pages.creator,
					layoutAuth: labels.pages.layoutAuth
				},
				header: labels.pages.creator.header,
				game: null
			};

			if(game && game.creatorId.equals(req.user._id)) {
				renderModel.game = JSON.parse(JSON.stringify(game));
				renderModel.game.timeStart = moment(new Date(game.timeStartNumber)).format("YYYY-MM-DD HH:mm:ss");
				delete renderModel.game.creatorId;
				renderModel.header = game.name;
			}

			res.render('creator', { renderModel: renderModel });
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
