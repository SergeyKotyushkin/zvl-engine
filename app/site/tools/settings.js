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

function parseError(req, err, page) {
	var labels = defaultSettings(req).labels;
	var isErrorKey = Object.prototype.toString.call(err) == '[object String]';

	if(!err || (!err.errors && !isErrorKey))
		return labels.messages.serverError;

	var messageKey = isErrorKey ? err : err.errors[Object.keys(err.errors)[0]].message;
	return labels.pages[page].messages[messageKey]
		? labels.pages[page].messages[messageKey]
		: labels.messages[messageKey]
			? labels.messages[messageKey]
			: labels.messages.serverError;
}

module.exports = {
	'default': defaultSettings,
	extended: extendedSettings,
	parseError: parseError
};
