const httpStatus = require('http-status');
const { _ } = require('lodash');
const User = require('../models/user.model');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
const Review = require('../models/review.model');
const { checkIsOwnerOfResurce } = require('../utils/helpers/resourceOwner');

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
    const { claimId } = req.query;

    // adding existing claim -> add articleId to claim and claimId to article
    if (claimId) {
      const claim = await Claim.addArticleId(claimId, req.locals.article._id);
      await Article.addClaimId(req.locals.article._id, claimId);

      res.status(httpStatus.CREATED);
      res.json(claim.transform());
    } else { // add new claim
      const claim = new Claim(_.assign(req.body, {
        addedBy: req.user.id,
        priority: 1,
        articleId: req.locals.article._id,
        articles: [req.locals.article._id],
      }));

      const savedClaim = await claim.save();
      await Article.addClaimId(req.locals.article._id, savedClaim._id);

      await User.addExp(req.user.id, 'createClaim');
      res.status(httpStatus.CREATED);
      res.json(savedClaim.transform());
    }
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
    const { claim } = req.locals;

    const savedClaim = await Claim.addArticleId(claim._id, req.locals.article._id);
    await Article.addClaimId(req.locals.article._id, claim._id);

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

    await checkIsOwnerOfResurce(claim.addedBy._id, req);

    const newClaim = new Claim(_.assign(req.body, {
      addedBy: req.user.id,
      priority: 1,
      articleId: req.locals.article._id,
      articles: [req.locals.article._id],
    }));

    const newClaimObject = _.omit(newClaim.toObject(), ['_id']);

    await claim.updateOne(newClaimObject, { override: true, upsert: true });
    const savedClaim = await Claim.get(claim._id);

    res.json(savedClaim.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing claim
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const { claim } = req.locals;

    await checkIsOwnerOfResurce(claim.addedBy._id, req);

    const newClaim = Object.assign(claim);
    if (req.body.text) newClaim.text = req.body.text;

    newClaim.save()
      .then((savedClaim) => res.json(savedClaim.transform()))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
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

    const claims = await Claim.find({ articleId: req.locals.article._id })
      .populate('articleId').populate('addedBy').limit(perPage)
      .skip(perPage * (page - 1));
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
exports.remove = async (req, res, next) => {
  try {
    const { claim } = req.locals;

    await checkIsOwnerOfResurce(claim.addedBy._id, req);

    claim.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};
