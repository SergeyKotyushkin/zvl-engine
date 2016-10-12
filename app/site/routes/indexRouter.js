function init(router) {
	var constants = require('../constants/index');
	var settings = require('../tools/settings');

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

	router.post('/api/tryToLogin', function (req, res, next) {
		var passwordHash = req.body.password;
		res.send(JSON.stringify({d: passwordHash}));
		res.end();
	});
}

module.exports = { init: init };
