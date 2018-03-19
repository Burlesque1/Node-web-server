var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/TodoApp'); // depreciated Mongoose 4.11.0
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true}); // a promise here

module.exports = {mongoose};
