const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
 * ReviewComment Schema
 * @private
 */
const commentSchema = new mongoose.Schema({
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  reviewId: {
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
    const fields = ['_id', 'addedBy', 'reviewId', 'text', 'proofUrls', 'createdAt'];

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
   * Get ReviewComment
   *
   * @param {ObjectId} id - The objectId of ReviewComment.
   * @returns {Promise<ReviewComment, APIError>}
   */
  async get(id) {
    let review;

    if (mongoose.Types.ObjectId.isValid(id)) {
      review = await this.findById(id).exec();
    }
    if (review) {
      return review;
    }

    throw new APIError({
      message: 'ReviewComment does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

/**
 * @typedef ReviewComment
 */
module.exports = mongoose.model('ReviewComment', commentSchema);
