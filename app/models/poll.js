var mongoose = require('mongoose');

var pollSchema = mongoose.Schema({
	userId : String,
	title : String,
	options : [{
		option : String,
		quantity : Number
	}]
});

module.exports = mongoose.model('Poll', pollSchema);