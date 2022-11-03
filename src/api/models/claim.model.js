const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
 * Claim Schema
 * @private
 */
const claimSchema = new mongoose.Schema({
  priority: {
    type: Number,
    default: 1,
  },
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
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      // required: true, TODO
      index: true,
    },
  ],
  text: {
    type: String,
    maxlength: 512,
    index: 'text',
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
  nNeutralVotes: {
    type: Number,
    default: 0,
    index: true,
  },
  neutralVotes: [{
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
claimSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'priority', 'addedBy', 'articleId', 'text',
      'createdAt', 'nPositiveVotes', 'positiveVotes', 'nNeutralVotes', 'neutralVotes',
      'nNegativeVotes', 'negativeVotes', 'articles'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
claimSchema.statics = {

  /**
   * Get Claim
   *
   * @param {ObjectId} id - The objectId of Claim.
   * @returns {Promise<Claim, APIError>}
   */
  async get(id) {
    let claim;

    if (mongoose.Types.ObjectId.isValid(id)) {
      claim = await this.findById(id).exec();
    }
    if (claim) {
      return claim;
    }

    throw new APIError({
      message: 'Claim does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },

  /**
   * Find Claim and push articleId into articles array
   *
   * @param {ObjectId} id - The objectId of Article.
   * @param {ObjectId} articleId - The objectId of Article that is added.
   * @returns {Promise<Article, APIError>}
   */
  async addArticleId(id, articleId) {
    let claim;

    if (mongoose.Types.ObjectId.isValid(id) && mongoose.Types.ObjectId.isValid(articleId)) {
      claim = await this.findByIdAndUpdate(id, {
        $push: { claims: articleId },
      });
    }
    if (claim) {
      return claim;
    }

    throw new APIError({
      message: 'Claim does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

// claimSchema.index({ text: 'text' });
/**
 * @typedef Claim
 */
module.exports = mongoose.model('Claim', claimSchema);
