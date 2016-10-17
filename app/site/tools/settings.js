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
	var labels = settings.default(req).labels;

	if(!err || !err.errors || !err.errors.length)
		return labels.messages.serverError;

	var messageKey = err.errors[Object.keys(err.errors)[0]].message;
	return labels.pages[page].messages[messageKey]
		? labels.pages[page].messages[messageKey]
		: labels.messages[messageKey]
			? labels.messages[messageKey]
			: labels.messages.serverError;
}

module.exports = {
	'default': defaultSettings,
	extended: extendedSettings,
	parseAuthError: parseAuthError
};
