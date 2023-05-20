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
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  //   index: true,
  // },
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
  nPositiveVotes: {
    type: Number,
    default: 0,
  },
  nNeutralVotes: {
    type: Number,
    default: 0,
  },
  nNegativeVotes: {
    type: Number,
    default: 0,
  },
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
    const fields = ['_id', 'claimId', 'articleId', 'addedBy', 'text', 'createdAt', 'vote', 'links', 'nBeenVoted', 'nNeutralVotes', 'nPositiveVotes', 'nNegativeVotes'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    // remove unwanted fields from populated User object
    const user = this.addedBy;
    const transformedUser = {};
    const userFields = ['_id', 'firstName', 'lastName', 'email', 'level'];

    if (this.addedBy) {
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
      review = await this.findById(id).populate('addedBy').exec();
    }
    if (review) {
      return review;
    }

    throw new APIError({
      message: 'Review does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },

  /**
   * List user's review in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of review to be skipped.
   * @param {number} limit - Limit number of review to be returned.
   * @param {ObjectId} addedBy - UserId of user who created resource
   * @returns {Promise<Article[]>}
   */
  userReviewsList({
    page = 1, perPage = 30, addedBy,
  }) {
    return this.find({ addedBy })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef Review
 */
module.exports = mongoose.model('Review', reviewSchema);
