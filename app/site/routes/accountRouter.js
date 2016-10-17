function init(router) {
	var authenticator = require('../tools/authenticator');
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");

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

			res.render('account', { renderModel: {
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
					}
				}
			});
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

}

module.exports = { init: init };
