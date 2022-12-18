const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
* Vote types
*/
const voteTypes = ['positive', 'negative', 'neutral', 'no_info'];

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
  links: [
    {
      type: String,
      maxlength: 512,
    },
  ],
  nBeenVoted: {
    type: Number,
    default: 0,
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
    const fields = ['_id', 'claimId', 'articleId', 'text', 'createdAt', 'vote', 'links', 'nBeenVoted'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    // remove unwanted fields from populated User object
    const user = this.userId;
    const transformedUser = {};
    const userFields = ['_id', 'firstName', 'lastName', 'email'];

    if (this.userId) {
      userFields.forEach((field) => {
        transformedUser[field] = user[field];
      });
    }
    transformed.addedBy = transformedUser;

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
    let review;

    if (mongoose.Types.ObjectId.isValid(id)) {
      review = await this.findById(id).populate('userId').exec();
    }
    if (review) {
      return review;
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
