var mongodb = require('../tools/mongodb.js');

var Schema = mongodb.schema;
var mongo = mongodb.mongo;

var schema = new Schema({
	name: { type: String, default: '' },
	creatorId: { type: Schema.Types.ObjectId , ref : 'User' },
	statistics: { type: Boolean, default: false },
	active: { type: Boolean, default: false },
	timeStartNumber: { type: Date , default : Date.now },
	levels: [{
		name: { type: String, default: '' },
		orderNumber: { type: Number , default : 0 },
		text: { type: String, default: '' },
		timeValues: [{ type: Number, default: 0 }],
		hints: [{
			name: { type: String, default: '' },
			orderNumber: { type: Number , default : 0 },
			text: { type: String, default: '' },
			timeValues: [{ type: Number, default: 0 }],
			images: [{
				orderNumber: { type: Number , default : 0 },
				url: { type: String, default: '' }
			}]
		}],
		images: [{
			orderNumber: { type: Number , default : 0 },
			url: { type: String, default: '' }
		}],
		sectors: [{
			orderNumber: { type: Number , default : 0 },
			answers: [{
				text: { type: String , default : '' }
			}]
		}]
	}],
	teams: [{ type: Schema.Types.ObjectId , ref : 'Team' }]
});

var model;

if (mongo.models.Game) {
	model = mongo.model('Game');
} else {
	model = mongo.model('Game', schema);
}

module.exports = model;
