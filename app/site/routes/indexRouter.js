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

			var labels = settings.default(req).labels;

			res.render('index', {
				renderModel: {
					user: {
						username: req.user.username,
					},
					labels: {
						messages: labels.messages,
						index: labels.pages.index,
						layout: labels.pages.layout
					}
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
