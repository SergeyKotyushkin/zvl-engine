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
						account: labels.pages.account,
						layoutAuth: labels.pages.layoutAuth
					},
					layoutAuthRenderModel: {
						user: {
							username: user.username,
							email: user.email,
							id: user.id
						}
					}
				}
			});
		});
	});
}

module.exports = { init: init };
