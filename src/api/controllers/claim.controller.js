const httpStatus = require('http-status');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
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
      articles: [req.locals.article._id],
    }));

    const savedClaim = await claim.save();
    await Article.addClaimId(req.locals.article._id, savedClaim._id);

    res.status(httpStatus.CREATED);
    res.json(savedClaim.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Add articleId to existing claim with claimId
 * @public
 */
exports.addExistingClaim = async (req, res, next) => {
  try {
    // const claim = req.claim
    console.log(req.locals);
    // new Claim(_.assign(req.body, {
    //   addedBy: req.user.id,
    //   priority: 1,
    //   articleId: req.locals.article._id,
    //   articles: [req.locals.article._id],
    // }));

    // const savedClaim = await claim.save();
    res.status(httpStatus.CREATED);
    res.json('yp');
    // res.json(savedClaim.transform());
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

/*
 * Takes `claims` array and logged user array of `reviews`
 * returns new array of merged claims with user's review for each claim
 */
const mergeClaimsWithReviews = async (claims, reviews) => {
  const mergedClaims = claims.map((claim) => {
    const userReview = _.find(reviews, { claimId: claim._id });

    const mergedClaim = _.assign(claim, { userReview });
    if (userReview) {
      mergedClaim.userReview = userReview.vote;
    } else {
      mergedClaim.userReview = null;
    }
    return mergedClaim;
  });

  return mergedClaims;
};

/**
 * Get claim list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const userReviews = await Review.find({ userId: req.user.id }).lean();

    const claims = await Claim.find().limit(perPage).skip(perPage * (page - 1));
    const transformedClaims = claims.map((x) => x.transform());

    const mergedClaims = await mergeClaimsWithReviews(transformedClaims, userReviews);
    res.json(mergedClaims);
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
