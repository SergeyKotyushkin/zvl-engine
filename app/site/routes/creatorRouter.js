function init(router) {
	var constants = require('../constants/index');
	var settings = require('../tools/settings');
	var userModel = require(__common + "/models/user");

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

	router.get('/:culture/creator', function (req, res, next) {
		if (!constants.labels.hasCulture(req.params.culture)) {
			res.redirect(['/', constants.settings.common.defaultCulture, '/creator'].join(''));
			return;
		}

		if(!req.user.isAdmin) {
			res.writeHead(303, { Location : req.headers.referer });
			res.end();
			return;
		}

		var labels = settings.default(req).labels;

		var gameId = req.query.id;

		res.render('creator', {
			renderModel: {
				labels: {
					messages: labels.messages,
					creator: labels.pages.creator,
					layoutAuth: labels.pages.layoutAuth
				},
				header: gameId ? gameId : labels.pages.creator.header
			}
		});
	});
}

module.exports = { init: init };
