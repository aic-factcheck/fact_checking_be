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

/*
 * SSL CA CERT filepath where cert will be stored
 * saved on flight into file from env.var since mongoose does not support env var ssl
 *
 * Add production params to MongoDB options
 * Add cert to mongo uri
 */
// let finalMongoUri = mongo.uri;
// if (env === 'production') {
//   const mongoCertPath = '/app/SSL_CERTS/mongo-ca-cert.crt';
//   fs.writeFileSync(mongoCertPath, mongo.cert);
//   mongooseOptions.ssl = true;
//   mongooseOptions.tlsCAFile = mongoCertPath;
//   finalMongoUri += `&tlsCAFile=${mongoCertPath}`;
// }

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
