var utils = require(__common + '/tools/utils');
var constants = require('../constants/index');

function defaultSettings(req) {
	return {
		culture: req.params.culture,
		labels: constants.labels.load(req.params.culture)
	};
}

function extendedSettings(req, extender) {
	return utils.merge(extender, defaultSettings(req));
}

function parseAuthError(req, err, page) {
	if(!err || !err.errors || !err.errors.length)
		return settings.default(req).labels.pages.messages.serverError;

	var messageKey = err.errors[Object.keys(err.errors)[0]].message;
	return settings.default(req).labels.pages[page].messages[messageKey];
}

module.exports = {
	'default': defaultSettings,
	extended: extendedSettings,
	parseAuthError: parseAuthError
};
