const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
 * Rating Schema
 * @private
 */
const ratingSchema = new mongoose.Schema({
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    index: true,
  },
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    index: true,
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: -1,
    max: 10,
  },
  text: {
    type: String,
    maxlength: 128,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
ratingSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'ratedBy', 'userId', 'articleId', 'claimId', 'reviewId', 'rating', 'text', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
ratingSchema.statics = {

  /**
   * Get Rating
   *
   * @param {ObjectId} id - The objectId of Rating.
   * @returns {Promise<Rating, APIError>}
   */
  async get(id) {
    let rating;

    if (mongoose.Types.ObjectId.isValid(id)) {
      rating = await this.findById(id).exec();
    }
    if (rating) {
      return rating;
    }

    throw new APIError({
      message: 'Rating does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

// TODO uncomment
// ratingSchema.index({ ratedBy: 1, userId: 1 }, { unique: true });
// ratingSchema.index({ ratedBy: 1, articleId: 1 }, { unique: true });
// ratingSchema.index({ ratedBy: 1, claimId: 1 }, { unique: true });

/**
 * @typedef Rating
 */
module.exports = mongoose.model('Rating', ratingSchema);
