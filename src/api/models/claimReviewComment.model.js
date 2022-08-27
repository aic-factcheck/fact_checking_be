const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
 * ClaimReviewComment Schema
 * @private
 */
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  claimReviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
    index: true,
  },
  text: {
    type: String,
    maxlength: 512,
  },
  proofUrls: [{
    type: String,
    maxlength: 256,
  }],
}, {
  timestamps: true,
});

/**
 * Methods
 */
commentSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'userId', 'claimReviewId', 'text', 'proofUrls', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
commentSchema.statics = {

  /**
   * Get ClaimReviewComment
   *
   * @param {ObjectId} id - The objectId of ClaimReviewComment.
   * @returns {Promise<ClaimReviewComment, APIError>}
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
      message: 'ClaimReviewComment does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

/**
 * @typedef ClaimReviewComment
 */
module.exports = mongoose.model('ClaimReviewComment', commentSchema);
