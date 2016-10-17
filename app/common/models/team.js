var mongodb = require('../tools/mongodb.js');

var Schema = mongodb.schema;
var mongo = mongodb.mongo;

var schema = new Schema({
	name: { type: String, default: '' },
	code: { type: String, default: '' },
	checked: { type: Boolean, default: false },
	captainId: { type: Schema.Types.ObjectId , ref : 'User' },
	userIds: [{ type: Schema.Types.ObjectId , ref : 'User' }]
});

var validatePresenceOf = function (value) {
	return value && value.length;
};

schema.path('name').validate(function (name, fn) {
	var Team = mongo.model('Team');

	if (this.isNew || this.isModified('name')) {
		Team.find({ name: name }).exec(function (err, teams) {
			fn(!err && teams.length === 0);
		});
	} else fn(true);
}, 'teamNameAlreadyExists');

schema.path('name').validate(function (name) {
	return name.length > 2;
}, 'teamNameLength');


var model;

if (mongo.models.Team) {
	model = mongo.model('Team');
} else {
	model = mongo.model('Team', schema);
}

module.exports = model;
