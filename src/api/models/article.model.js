const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
* Article types
*/
const articleTypes = ['article', 'tv', 'radio', 'other'];

/**
* Languages
*/
const languages = ['cz', 'sk', 'en'];

/**
 * Article Schema
 * @private
 */
const articleSchema = new mongoose.Schema({
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  text: {
    type: String,
    maxlength: 16448,
  },
  claims: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      // required: true,
      index: true,
    },
  ],
  sourceUrl: {
    type: String,
    maxlength: 512,
  },
  sourceType: {
    type: String,
    enum: articleTypes,
    default: 'article',
  },
  language: {
    type: String,
    enum: languages,
    default: 'cz',
  },
  nPositiveVotes: {
    type: Number,
    default: 0,
    index: true,
  },
  positiveVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  nNegativeVotes: {
    type: Number,
    default: 0,
    index: true,
  },
  negativeVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

/**
 * Methods
 */
articleSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'addedBy', 'text', 'sourceUrl', 'sourceType', 'language', 'createdAt',
      'nPositiveVotes', 'positiveVotes', 'nNegativeVotes', 'negativeVotes', 'claims'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
articleSchema.statics = {

  articleTypes,
  languages,

  /**
   * Get Article
   *
   * @param {ObjectId} id - The objectId of Article.
   * @returns {Promise<Article, APIError>}
   */
  async get(id) {
    let article;

    if (mongoose.Types.ObjectId.isValid(id)) {
      article = await this.findById(id).exec();
    }
    if (article) {
      return article;
    }

    throw new APIError({
      message: 'Article does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },

  /**
   * Find article and push claimId into claims array
   *
   * @param {ObjectId} id - The objectId of Article.
   * @param {ObjectId} claimId - The objectId of Claim that is added.
   * @returns {Promise<Article, APIError>}
   */
  async addClaimId(id, claimId) {
    let article;

    if (mongoose.Types.ObjectId.isValid(id) && mongoose.Types.ObjectId.isValid(claimId)) {
      article = await this.findByIdAndUpdate(id, {
        $push: { claims: claimId },
      });
    }
    if (article) {
      return article;
    }

    throw new APIError({
      message: 'Article does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

/**
 * @typedef Article
 */
module.exports = mongoose.model('Article', articleSchema);
