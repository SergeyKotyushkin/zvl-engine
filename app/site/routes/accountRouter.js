function init(router) {
	var authenticator = require('../tools/authenticator');
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");
	var teamModel = require(__common + "/models/team");

	router.get('/:culture/account', function (req, res, next) {
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

			var labels = settings.default(req).labels;
			var renderModel = {
				labels: {
					messages: labels.messages,
					account: labels.pages.account,
					layoutAuth: labels.pages.layoutAuth
				},
				layoutAuthRenderModel: {
					user: {
						username: user.username,
						email: user.email,
						id: user.id,
						isAdmin: user.isAdmin
					}
				},
				team: {
					isEmpty: true
				}
			};

			// Load team info
			teamModel.findOne({userIds: user._id}, function(err, team) {
				if(err) {
					res.redirect(['/', req.params.culture].join(''));
					return;
				}

				if(!team) {
					res.render('account', { renderModel: renderModel });
					return;
				}

				userModel.find({ _id: { $in: team.userIds } }, '_id username', function(err, users) {
					if(err || !users) {
						res.redirect(['/', req.params.culture].join(''));
						return;
					}

					renderModel.team = {
						isEmpty: false,
						name: team.name,
						captainId: team.captainId,
						isCaptain: team.captainId.equals(user._id),
						users: users
					}
					res.render('account', { renderModel: renderModel });
				});

			})
		});
	});

	// ajax post requests
	router.post('/account/changeUsername', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			res.redirect(['/', req.params.culture].join(''));
			return;
		}

		userModel.update(
			{ _id: req.user._id },
			{ username: req.body.newUsername },
			{},
			function(err, user) {
				if(err || !user) {
					res.json({
						message: settings.parseAuthError(req, err, 'account'),
						success: false
					});
					return;
				}

			res.json({ success: true, message: req.body.newUsername });
		});
	});

	router.post('/account/changePassword', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			res.redirect(['/', req.params.culture].join(''));
			return;
		}

		userModel.findById(req.user._id, function(err, user) {
			if(err || !user || !user.authenticate(req.body.oldPassword)) {
				res.json({
					message: settings.parseAuthError(req, err, 'account'),
					success: false
				});
				return;
			}

			user.set('password', req.body.newPassword);
			user.save(function(err, user) {
				if(err || !user) {
					res.json({
						message: settings.parseAuthError(req, err, 'account'),
						success: false
					});
					return;
				}

				res.json({ success: true });
			});
		});
	});

	router.post('/account/createTeam', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			res.redirect(['/', req.params.culture].join(''));
			return;
		}

		var labels = settings.default(req).labels;
		userModel.findById(req.user._id, function(err, user) {
			if(err || !user) {
				res.json({
					message: settings.parseAuthError(req, err, 'account'),
					success: false
				});
				return;
			}

			teamModel.find({userIds: req.user._id}, function(err, teams) {
				if(err || !teams) {
					res.json({
						message: settings.parseAuthError(req, err, 'account'),
						success: false
					});
					return;
				}

				if(teams.length > 0) {
					res.json({
						message: labels.messages.userHasTeamAlready,
						success: false
					});
					return;
				}

				teamModel.create({
					name: req.body.newTeamName,
					captainId: req.user._id,
					userIds: [req.user._id]
				}, function(err, team) {
					if(err || !team) {
						res.json({
							message: settings.parseAuthError(req, err, 'account'),
							success: false
						});
						return;
					}

					userModel.find({ _id: { $in: team.userIds } }, '_id username', function(err, users) {
						if(err || !users) {
							res.json({
								message: settings.parseAuthError(req, err, 'account'),
								success: false
							});
							return;
						}

						res.json({
							success: true,
							isEmpty: false,
							name: req.body.newTeamName,
							captainId: team.captainId,
							isCaptain: team.captainId.equals(user._id),
							users: users,
							message: labels.pages.account.messages.teamHasCreated
						});
					})
				});
			});
		});
	});

}

module.exports = { init: init };
