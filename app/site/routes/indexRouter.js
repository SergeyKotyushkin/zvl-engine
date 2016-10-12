function init(router) {
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");

	router.get('/:culture', function (req, res, next) {
		if (constants.labels.hasCulture(req.params.culture))
			res.render('index', settings.extended(req, { user: req.user }));
		else
			res.redirect('/' + constants.settings.common.defaultCulture);
	});

	router.get('/', function (req, res, next) {
		if (req.cookies.culture)
			res.redirect('/' + req.cookies.culture);
		else
			res.redirect('/' + constants.settings.common.defaultCulture);
	});

	router.get('/:culture/center', function (req, res, next) {
		if(!req.user.isAuthenticated) {
			res.redirect('/' + req.params.culture);
			return;
		}

		res.write("center");
		res.end();
	});
}

module.exports = { init: init };
