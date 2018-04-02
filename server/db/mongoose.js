var mongoose = require('mongoose');

// not using third-party Promise library here
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI); // a promise here

module.exports = {mongoose};
