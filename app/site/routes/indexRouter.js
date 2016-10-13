function init(router) {
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");

	router.get('/:culture', function (req, res, next) {
		if (constants.labels.hasCulture(req.params.culture)) {
			if(req.user.isAuthenticated) {
				res.redirect(['/', req.params.culture, '/center'].join(''));
				return;
			}

			res.render('index', {
				renderModel: {
					user: req.user,
					settings: settings.default(req)
				}
			});
		} else {
			res.redirect(['/', constants.settings.common.defaultCulture].join(''));
		}
	});

	router.get('/', function (req, res, next) {
		if (req.cookies.culture)
			res.redirect(['/', req.cookies.culture].join(''));
		else
			res.redirect(['/', constants.settings.common.defaultCulture].join(''));
	});
}

module.exports = { init: init };
