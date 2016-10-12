function init(router) {
	var constants = require('../constants/index');
	var settings = require('../tools/settings');

	router.get('/:culture', function (req, res, next) {
		res.write("test");
		res.end();
	});

	router.get('/', function (req, res, next) {
		if (req.cookies.culture)
			res.redirect('/' + req.cookies.culture);
		else
			res.redirect('/' + constants.settings.common.defaultCulture);
	});
}

module.exports = { init: init };
