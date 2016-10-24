function init(router) {
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");
	var gameModel = require(__common + "/models/game");
	var gameDetailsModel = require(__common + "/models/gameDetails");
	var moment = require('moment');

	const CurrentLevel = 0;
	const GameIsNotStarted = 1;
	const GameWasFinished = 2;

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

	function getTimeFromValues(timeValues) {
		return 1000*(60*(60*timeValues[0] + timeValues[1]) + timeValues[2]);
	}

	function getCurrentLevel(userId, gameId, timeServer, timeClient, callback) {
		var timeDifference = timeServer - timeClient;

		gameModel
    .findById(gameId)
    .populate('teams')
    .exec(function(err, game) {
        if (err || !game) {
            return callback(err, null);
        }

        var teamId = null;
        for (var i = 0; i < game.teams.length; i++) {
            if (game.teams[i].userIds.indexOf(userId) === -1)
                continue;

            teamId = game.teams[i]._id;
            break;
        }

        if (teamId == null) {
            return callback(err, null); // user is not allowed for game
        }

        gameDetailsModel.findOne({
                gameId: gameId,
                teamId: teamId,
                $or: {[{passed: true}, {autoPassed: true}]}
            }, '_id levelId timeStart timeEnd', {sort: {timeStart: 1}})
						.populate('levelId'),
            .exec(function(err, gameDetails) {
							if(err) {
								return callback(err, null);
							}

							var lastLevel = gameDetails
								?	{
										id: gameDetails.levelId,
										orderNumber: gameDetails.levelId.orderNumber,
										timeEnd: gameDetails.timeEnd
									}
								: null;

							var currentLevel = null;
							var currentTime = lastLevel ? lastLevel.timeEnd : game.timeStart

							if(timeServer < currentTime) {
								return(null, {result: GameIsNotStarted, timeStart: game.timeStart + timeDifference});
							}

							currentTime = new Date(currentTime+1000).getTime();

							var levelStart = false;
							var insertParams = [];
							var thisLevel = false;

							for (var i = 0; i < game.levels.length; i++) {

								if(lastLevel) {
									if(!levelStart)
										if(game.levels._id.equals(lastLevel.id))
											levelStart = true;
										continue;
								}

								currentLevel = {
									id: game.levels[i]._id,
									timeStart: currentTime
								};

								var insertParam.TimeStart = currentTime;
								currentTime += getTimeFromValues(game.levels[i].time);

								thisLevel = timeServer < currentTime;

								for (var j = 0; j < game.levels[i].hints.length; j++) {
									currentTime += getTimeFromValues(game.levels[i].hints[j].time);
									var hint = {isEmpty: true, id: game.levels[i].hints[j]._id, timeToHint: currentTime+timeDifference};

									if(thisLevel) {
										currentLevel.hints.push(hint);
										continue;
									}

									hint.isEmpty = false;
									hint.name = game.levels[i].hints[j].name;
									hint.text = game.levels[i].hints[j].text;
									currentLevel.hints.push(hint);
									currentLevel.currentHintId = game.levels[i].hints[j]._id;
									if(timeServer < currentTime)
										thisLevel = true;
								}

								if(thisLevel)
									break;

								insertParam.levelId = game.levels[i]._id;
								insertParam.hintOrderNumber = 0;
								insertParam.timeEnd = currentTime;
								insertParams.push(insertParam);
							}

							if(thisLevel) {
								currentLevel.timeEndLevel = currentTime + timeDifference;
								return callback(null, {result: CurrentLevel, place: 3, insertParams: insertParams});
							}

							return callback(null, {result: GameWasFinished, currentLevel: currentLevel, insertParams: insertParams});
						});
    })
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
			var currentLevel = getCurrentLevel(req.user.id, game._id, Date.now(), Date.now(), function(err, data) {
				if(err || !data) {
					return handleJsonError(req, res, err);
				}

				var levelData = null;
				switch(currentLevel.result) {
					case GameIsNotStarted: levelData = {result: GameIsNotStarted, data.timeStart.toString()}; break;
					case GameWasFinished: levelData = {result: GameWasFinished, place: data.place}; break;
					default: {
						var level = null;
						for (var i = 0; i < game.levels.length; i++) {
							if(!game.levels[i]._id.equals(data.currentLevel.id))
								continue;

							level.id = game.levels[i]._id;
							level.text = game.levels[i].text;
							level.name = game.levels[i].name;
							level.timeEndLevel = data.timeEndLevel.toString();
							level.hints = [];
							for (var j = 0; j < level.hints.length; i++) {
								level.hints.push({
									id: level.hints[j]._id,
									name: level.hints[j].name,
									text: level.hints[j].text,
									timeToHint: level.hints[j].timeToHint,
									isEmpty: level.hints[j].isEmpty
								});
							}
							levelData = {result: CurrentLevel, data.place}; break;
						}

						levelData = {result: GameWasFinished, level: level}; break;
					}
				}

			});


			var renderModel = {
				labels: {
					messages: labels.messages,
					game: labels.pages.game,
					layoutAuth: labels.pages.layoutAuth
				},
				username: req.user.username || 'someone',
				name: game.name,
				levelData: levelData,
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
