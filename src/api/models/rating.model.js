const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
* Vote types
*/
const voteTypes = ['positive', 'negative', 'neutral'];

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
    required: true,
    index: true,
  },
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
    index: true,
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
    const fields = ['_id', 'userId', 'claimId', 'text', 'createdAt', 'vote',
      'nUpvotes', 'upvotes', 'nDownvotes', 'downvotes'];

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

  voteTypes,

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

/**
 * @typedef Rating
 */
module.exports = mongoose.model('Rating', ratingSchema);
