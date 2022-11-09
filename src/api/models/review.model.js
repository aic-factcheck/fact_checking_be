const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
* Vote types
*/
const voteTypes = ['positive', 'negative', 'neutral'];

/**
 * Review Schema
 * @private
 */
const reviewSchema = new mongoose.Schema({
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
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    // required: true, TODO ?
  },
  text: {
    type: String,
    maxlength: 512,
  },
  vote: {
    type: String,
    enum: voteTypes,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
reviewSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'userId', 'claimId', 'articleId', 'text', 'createdAt', 'vote'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
reviewSchema.statics = {

  voteTypes,

  /**
   * Get Review
   *
   * @param {ObjectId} id - The objectId of Review.
   * @returns {Promise<Review, APIError>}
   */
  async get(id) {
    let inv;

    if (mongoose.Types.ObjectId.isValid(id)) {
      inv = await this.findById(id).exec();
    }
    if (inv) {
      return inv;
    }

    throw new APIError({
      message: 'Review does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

/**
 * @typedef Review
 */
module.exports = mongoose.model('Review', reviewSchema);
