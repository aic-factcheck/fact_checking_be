const httpStatus = require('http-status');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const Review = require('../models/review.model');

/**
 * Load claim and append to req.
 * @public
 */
exports.loadClaim = async (req, res, next, id) => {
  try {
    const claim = await Claim.get(id);
    req.locals = _.assign(req.locals, { claim });
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get claim
 * @public
 */
exports.get = async (req, res, next) => {
  const usr = req.user;
  try {
    const currentUserReview = await Review.findOne({
      userId: usr._id,
      claimId: req.locals.claim._id,
    });

    let resJson = _.assign(req.locals.claim.transform());

    if (currentUserReview) {
      resJson = _.merge(resJson, { userReview: currentUserReview });
    }
    res.json(resJson);
  } catch (e) {
    next(e);
  }
};

/**
 * Create new claim
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const claim = new Claim(_.assign(req.body, {
      addedBy: req.user.id,
      priority: 1,
      articleId: req.locals.article._id,
    }));
    const savedClaim = await claim.save();
    res.status(httpStatus.CREATED);
    res.json(savedClaim.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Replace existing claim
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { claim } = req.locals;
    const newClaim = new Claim(req.body);

    await claim.updateOne(newClaim, { override: true, upsert: true });
    const savedClaim = await Claim.findById(claim._id);

    res.json(savedClaim.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing claim
 * @public
 */
exports.update = (req, res, next) => {
  const claim = Object.assign(req.locals.claim, req.body);

  claim.save()
    .then((savedClaim) => res.json(savedClaim.transform()))
    .catch((e) => next(e));
};

/**
 * Get claim list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const claims = await Claim.find().limit(perPage).skip(perPage * (page - 1));
    const transformedClaims = claims.map((x) => x.transform());
    res.json(transformedClaims);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete claim
 * @public
 */
exports.remove = (req, res, next) => {
  const { claim } = req.locals;

  claim.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e) => next(e));
};
