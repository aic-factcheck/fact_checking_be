const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
 * Vote Schema
 * @private
 */
const voteSchema = new mongoose.Schema({
  addedBy: {
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
voteSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'userId', 'articleId', 'claimId', 'reviewId', 'rating', 'text', 'createdAt', 'addedBy'];

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
voteSchema.statics = {

  /**
   * Get Vote
   *
   * @param {ObjectId} id - The objectId of Vote.
   * @returns {Promise<Vote, APIError>}
   */
  async get(id) {
    let vote;

    if (mongoose.Types.ObjectId.isValid(id)) {
      vote = await this.findById(id).populate('addedBy').exec();
    }
    if (vote) {
      return vote;
    }

    throw new APIError({
      message: 'Vote does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

// voteSchema.index({ addedBy: 1, userId: 1 }, { unique: true });
// voteSchema.index({ addedBy: 1, articleId: 1 }, { unique: true });
// voteSchema.index({ addedBy: 1, claimId: 1 }, { unique: true });
// voteSchema.index({ addedBy: 1, reviewId: 1 }, { unique: true });

/**
 * @typedef Vote
 */
module.exports = mongoose.model('Vote', voteSchema);
