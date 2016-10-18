function init(router) {
	var authenticator = require('../tools/authenticator');
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");
	var teamModel = require(__common + "/models/team");
	var inviteModel = require(__common + "/models/invite");


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

	function loadInvites(userId, callback) {
		inviteModel
			.find({ toUserId: userId, active: true })
			.populate('fromTeamId', 'name')
			.exec(function(err, invites) {
				return callback({ invites: err ? null : invites, err: err	});
			})
	}

	function loadTeam(userId, callback) {
		teamModel
			.findOne({userIds: userId})
			.populate('userIds', 'username')
			.exec(function(err, team) {
				return callback({ team: err ? null : team, err: err	});
			})
	}


	router.get('/:culture/account', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			return handleLogoutError(res);
		}

		// load user data
		userModel.findOne({ _id: req.user._id }, function(err, user) {
			if(err || !user) {
				return handleLogoutError(res);
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

			loadInvites(user._id, function(invitesResult) {
				if(invitesResult.err) {
					return handleLogoutError(res);
				}

				renderModel.invites = invitesResult.invites;

				loadTeam(user._id, function(teamResult) {
					if(teamResult.err) {
						return handleLogoutError(res);
					}

					var team = teamResult.team;
					if(team) {
						renderModel.team = {
							isEmpty: false,
							name: team.name,
							captainId: team.captainId,
							isCaptain: team.captainId.equals(user._id),
							users: team.userIds
						};
					}

					res.render('account', { renderModel: renderModel });
				});
			});
		});
	});

	// ajax post requests
	router.post('/account/changeUsername', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			return handleLogoutError(res);
		}

		userModel.update(
			{ _id: req.user._id },
			{ username: req.body.newUsername },
			{},
			function(err, user) {
				if(err || !user) {
					return handleJsonError(req, res, err);
				}

				res.json({
					success: true,
					message: settings.default(req).labels.pages.account.messages.usernameWasChanged,
					newUsername: req.body.newUsername
			});
		});
	});

	router.post('/account/changePassword', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			return handleLogoutError(res);
		}

		userModel.findById(req.user._id, function(err, user) {
			if(err || !user || !user.authenticate(req.body.oldPassword)) {
				return handleJsonError(req, res, err);
			}

			user.set('password', req.body.newPassword);
			user.save(function(err, user) {
				if(err || !user) {
					return handleJsonError(req, res, err);
				}

				res.json({ success: true });
			});
		});
	});

	router.post('/account/createTeam', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			return handleLogoutError(res);
		}

		var labels = settings.default(req).labels;
		userModel.findById(req.user._id, function(err, user) {
			if(err || !user) {
				return handleJsonError(req, res, err);
			}

			teamModel.find({userIds: req.user._id}, function(err, teams) {
				if(err || !teams) {
					return handleJsonError(req, res, err);
				}

				if(teams.length > 0) {
					return handleJsonError(req, res, labels.messages.userHasTeamAlready);
				}

				teamModel.create({
					name: req.body.newTeamName,
					captainId: req.user._id,
					userIds: [req.user._id]
				}, function(err, team) {
					if(err || !team) {
						return handleJsonError(req, res, err);
					}

					var userIds = [{ _id: user._id, username: user.username }];
					res.json({
						success: true,
						isEmpty: false,
						name: req.body.newTeamName,
						captainId: team.captainId,
						isCaptain: true,
						users: userIds,
						message: labels.pages.account.messages.teamHasCreated
					});
				});
			});
		});
	});

	router.post('/account/inviteUser', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			return handleLogoutError(res);
		}

		var labels = settings.default(req).labels;

		// find user
		userModel.findOne({username: req.body.username}, function(err, user) {
			if(err) {
				return handleLogoutError(res);
			}

			if(!user) {
				return handleJsonError(req, res, labels.pages.account.messages.userNotFound);
			}

			// find user team
			teamModel.findOne({captainId: req.user._id}, function(err, team) {
				if(err || !team) {
					return handleJsonError(req, res, err);
				}

				// check invite
				inviteModel.count({
					fromUserId: req.user._id,
					fromTeamId: team._id,
					toUserId: user._id,
					active: true
				}, function(err, count) {
					if(err) {
						return handleJsonError(req, res, err);
					}

					if(count > 0) {
						res.json({
							success: true,
							message: labels.pages.account.messages.inviteWasSent
						});
						return;
					}

					// invite user
					inviteModel.create({
							fromUserId: req.user._id,
							fromTeamId: team._id,
							toUserId: user._id
						}, function(err, invite) {
							if((err && err.code !== 11000 && err.code !== 11001) || (!err && !invite)) {
								return handleJsonError(req, res, err);
							}

							res.json({
								success: true,
								message: labels.pages.account.messages.inviteWasSent
							});
						});
				});
			});
		});
	});
}

module.exports = { init: init };
