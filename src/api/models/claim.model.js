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
  nNegativeVotes: {
    type: Number,
    default: 0,
  },
  nPositiveVotes: {
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
claimSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'priority', 'addedBy', 'articleId', 'text', 'createdAt', 'articles', 'nPositiveVotes', 'nNegativeVotes', 'nBeenVoted'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    // remove unwanted fields from populated User object
    const user = this.addedBy;
    const transformedUser = {};
    const userFields = ['_id', 'firstName', 'lastName', 'email'];

    if (this.addedBy) {
      userFields.forEach((field) => {
        transformedUser[field] = user[field];
      });
    }
    transformed.addedBy = transformedUser;

    // remove unwanted fields from populated ArticleId and append as article
    const article = this.articleId;
    const transformedArticle = {};
    const articleFields = ['_id', 'sourceType', 'language', 'title', 'sourceUrl', 'createdAt'];

    if (this.addedBy) {
      articleFields.forEach((field) => {
        transformedArticle[field] = article[field];
      });
    }
    transformed.article = transformedArticle;
    transformed.articleId = this.articleId._id;

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
      claim = await this.findById(id)
        .populate('articleId').populate('addedBy').exec();
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
   * List claims in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of claims to be skipped.
   * @param {number} limit - Limit number of claims to be returned.
   * @returns {Promise<Claim[]>}
   */
  list({
    page = 1, perPage = 30,
  }) {
    return this.find({})
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
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

  /**
   * List user's claims in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of articles to be skipped.
   * @param {number} limit - Limit number of articles to be returned.
   * @param {ObjectId} userId - UserId of user who created resource
   * @returns {Promise<Article[]>}
   */
  userClaimsList({
    page = 1, perPage = 30, addedBy,
  }) {
    return this.find({ addedBy })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

// claimSchema.index({ text: 'text' });
/**
 * @typedef Claim
 */
module.exports = mongoose.model('Claim', claimSchema);
