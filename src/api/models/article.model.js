const mongoose = require('mongoose');
const httpStatus = require('http-status');
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
  title: {
    type: String,
    maxlength: 256,
    index: true,
    required: true,
  },
  text: {
    type: String,
    maxlength: 16448,
    index: true,
  },
  claims: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: true,
      // index: true,
    },
  ],
  sourceUrl: {
    type: String,
    maxlength: 512,
    index: true,
  },
  sourceType: {
    type: String,
    enum: articleTypes,
    default: 'article',
  },
  lang: {
    type: String,
    enum: languages,
    default: 'cz',
  },
  nBeenVoted: {
    type: Number,
    default: 0,
  },
  nNegativeVotes: {
    type: Number,
    default: 0,
  },
  nPositiveVotes: {
    type: Number,
    default: 0,
  },
  nSaved: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
articleSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'title', 'text', 'sourceUrl', 'sourceType', 'lang', 'createdAt', 'claims', 'nBeenVoted', 'nSaved', 'nNegativeVotes', 'nPositiveVotes'];

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
      article = await this.findById(id).populate('addedBy').exec();
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

  /**
   * List articles in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of articles to be skipped.
   * @param {number} limit - Limit number of articles to be returned.
   * @returns {Promise<Article[]>}
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
};

articleSchema.index({
  title: 'text',
  text: 'text',
  sourceUrl: 'text',
});
/**
 * @typedef Article
 */
module.exports = mongoose.model('Article', articleSchema);
