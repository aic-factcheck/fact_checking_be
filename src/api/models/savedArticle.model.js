const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
 * SavedArticle Schema
 * @private
 */
const savedArticleSchema = new mongoose.Schema({
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
savedArticleSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'addedBy', 'articleId', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
savedArticleSchema.statics = {

  /**
   * Get SavedArticle
   *
   * @param {ObjectId} id - The objectId of SavedArticle.
   * @returns {Promise<SavedArticle, APIError>}
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
      message: 'SavedArticle does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

savedArticleSchema.index({ addedBy: 1, articleId: 1 }, { unique: true });

/**
 * @typedef SavedArticle
 */
module.exports = mongoose.model('SavedArticle', savedArticleSchema);
