const httpStatus = require('http-status');
const { _, omit } = require('lodash');
const User = require('../models/user.model');
const Article = require('../models/article.model');
const Claim = require('../models/claim.model');
const Review = require('../models/review.model');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = _.assign(req.locals, { user });
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user.transform());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = async (req, res, next) => {
  try {
    const baseUserInfo = req.user.transform();
    baseUserInfo.nArticles = await Article.countDocuments({ addedBy: req.user.id }).exec();
    baseUserInfo.nClaim = await Claim.countDocuments({ addedBy: req.user.id }).exec();
    baseUserInfo.nReviews = await Review.countDocuments({ userId: req.user.id }).exec();
    res.json(baseUserInfo);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { user } = req.locals;
    const newUser = new User(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.updateOne(newUserObject, { override: true, upsert: true });
    const savedUser = await User.findById(user._id);

    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
  const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
  const updatedUser = omit(req.body, ommitRole);
  const user = Object.assign(req.locals.user, updatedUser);

  user.save()
    .then((savedUser) => res.json(savedUser.transform()))
    .catch((e) => next(User.checkDuplicateEmail(e)));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const users = await User.list(req.query);
    const transformedUsers = users.map((user) => user.transform());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;

  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e) => next(e));
};

/**
 * Get list of user's articles
 * @public
 */
exports.getUsersArticles = async (req, res, next) => {
  try {
    req.query.addedBy = req.user.id; // add current userId to req.query to be parsed in db query
    const articles = await Article.userArticlesList(req.query);
    const transformedArticles = articles.map((x) => x.transform());
    res.json(transformedArticles);
  } catch (e) {
    next(e);
  }
};

/**
 * Get list of user's claims
 * @public
 */
exports.getUsersClaims = async (req, res, next) => {
  try {
    req.query.addedBy = req.user.id; // add current userId to req.query to be parsed in db query
    const claims = await Claim.userClaimsList(req.query);
    const transformedClaims = claims.map((x) => x.transform());
    res.json(transformedClaims);
  } catch (e) {
    next(e);
  }
};
