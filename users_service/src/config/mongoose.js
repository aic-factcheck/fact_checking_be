const mongoose = require('mongoose');
// const fs = require('fs');
const logger = require('./logger');
const { mongo, env } = require('./vars');

// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}

/*
 * Define options and setup MongoDB params
 */
const mongooseOptions = {
  useCreateIndex: true,
  keepAlive: 1,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  mongoose
    .connect(mongo.uri, mongooseOptions)
    .then(() => console.log('mongoDB connected...'));

  return mongoose.connection;
};
