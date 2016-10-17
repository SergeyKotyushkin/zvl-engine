var mongodb = require('../tools/mongodb.js');

var Schema = mongodb.schema;
var mongo = mongodb.mongo;

var schema = new Schema({
	fromUserId: { type: Schema.Types.ObjectId , ref : 'User' },
	fromTeamId: { type: Schema.Types.ObjectId , ref : 'Team' },
	toUserId: { type: Schema.Types.ObjectId , ref : 'User' },
	active: { type: Boolean, default: true },
	answer: { type: Number, default: 0 }
});

schema.index({ fromTeamId: 1, toUserId: 1, active: 1}, { unique: true });

var model;

if (mongo.models.TeamUser) {
	model = mongo.model('Invite');
} else {
	model = mongo.model('Invite', schema);
}

module.exports = model;
