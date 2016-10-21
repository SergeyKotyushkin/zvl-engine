var mongodb = require('../tools/mongodb.js');

var Schema = mongodb.schema;
var mongo = mongodb.mongo;

var schema = new Schema({
	name: { type: String, default: '' },
	gameId: { type: Schema.Types.ObjectId , ref : 'Game' },
	teamId: { type: Schema.Types.ObjectId , ref : 'Team' },
	userId: { type: Schema.Types.ObjectId , ref : 'User' },
	levelId: { type: Schema.Types.ObjectId , ref : 'Level' },
	hintOrderNumber: { type: Number , default : 0 },
	passed: { type: Boolean, default: false },
	autoPassed: { type: Boolean, default: false },
	timeStart: { type: Date , default : Date.now },
	timeEnd: { type: Date , default : Date.now }
});

var model;

if (mongo.models.Team) {
	model = mongo.model('GameDetails');
} else {
	model = mongo.model('GameDetails', schema);
}

module.exports = model;
