const httpStatus = require('http-status');
const { _ } = require('lodash');
const Review = require('../models/review.model');

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
exports.get = (req, res) => {
  res.json(req.locals.review.transform());
};

/**
 * Create new Review
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const review = new Review(_.assign(req.body, {
      userId: req.user.id,
      priority: 1,
      claimId: req.locals.claim._id,
    }));
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
    const reviews = await Review.find().limit(perPage).skip(perPage * (page - 1));
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
