const httpStatus = require('http-status');
const { _ } = require('lodash');
const User = require('../models/user.model');
const Vote = require('../models/vote.model');
const Review = require('../models/review.model');
const APIError = require('../errors/api-error');

/**
 * Load review and append to req.
 * @public
 */
exports.loadReview = async (req, res, next, id) => {
  try {
    const review = await Review.get(id);
    req.locals = _.assign(req.locals, { review });
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get Review
 * @public
 */
exports.get = async (req, res, next) => {
  try {
    const review = req.locals.review.transform();
    const userVote = await Vote.findOne({
      reviewId: req.locals.review._id,
      addedBy: req.user.id,
    });

    if (!_.isNil(userVote)) review.userVote = userVote.rating;

    res.json(review);
  } catch (error) {
    next(error);
  }
};

/*
 * Check whether user (who sends the request) already voted
 * for this claim -> throws conflict http status
 */
const checkCurrentUserReview = async (userId, claimId, next) => {
  const review = await Review.findOne({ userId, claimId });

  if (review) {
    throw new APIError({
      status: httpStatus.CONFLICT,
      message: 'User already reviewed this claim.',
    });
  }
};

/**
 * Create new Review
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    await checkCurrentUserReview(req.user.id, req.locals.claim._id, next);

    if (req.user.id === req.locals.claim._id) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: 'Owner of a claim cannot review it.',
      });
    }

    const review = new Review(_.assign(req.body, {
      userId: req.user.id,
      priority: 1,
      claimId: req.locals.claim._id,
    }));

    const claim = Object.assign(req.locals.claim);

    // based on vote type, update claim's votes
    if (req.body.vode === 'positive') {
      claim.nPositiveVotes += 1;
      claim.positiveVotes = [...claim.positiveVotes, req.user.id];
    } else if (req.body.vode === 'neutral') {
      claim.nNeutralVotes += 1;
      claim.neutralVotes = [...claim.neutralVotes, req.user.id];
    } else if (req.body.vode === 'negative') {
      claim.nNegativeVotes += 1;
      claim.negativeVotes = [...claim.negativeVotes, req.user.id];
    }

    await claim.save();
    await User.findOneAndUpdate({ _id: req.user.id }, { $inc: { nReviews: 1 } }).exec();

    const savedReview = await review.save();
    res.status(httpStatus.CREATED);
    res.json(savedReview.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Replace existing review
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { review } = req.locals;
    const newReview = new Review(req.body);

    await review.updateOne(newReview, { override: true, upsert: true });
    const savedReview = await Review.findById(review._id);

    res.json(savedReview.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing review
 * @public
 */
exports.update = (req, res, next) => {
  const review = Object.assign(req.locals.review, req.body);

  review.save()
    .then((savedReview) => res.json(savedReview.transform()))
    .catch((e) => next(e));
};

/**
 * Get review list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const reviews = await Review.find({ claimId: req.locals.claim._id }).populate('userId').limit(perPage).skip(perPage * (page - 1));
    const transformedReviews = reviews.map((x) => x.transform());
    res.json(transformedReviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review
 * @public
 */
exports.remove = (req, res, next) => {
  const { review } = req.locals;

  review.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e) => next(e));
};
