// const httpStatus = require('http-status');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const User = require('../models/user.model');
const Review = require('../models/review.model');
const Article = require('../models/article.model');
const SavedArticle = require('../models/savedArticle.model');
const { mergeClaimsWithReviews } = require('../utils/helpers/mergeReviewsClaims');

/**
 * GET search for user-name
 * @public
 */
exports.searchUsers = async (req, res, next) => {
  try {
    const { page, perPage, text } = req.query;

    const claims = await User.find({
      $text: {
        $search: text,
        $diacriticSensitive: false,
      },
    })
      .limit(perPage)
      .skip(perPage * (page - 1));

    res.json(claims);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Search claims
 * @public
 */
exports.searchClaims = async (req, res, next) => {
  try {
    const { page, perPage, text } = req.query;

    const userReviews = await Review.find({ addedBy: req.user.id }).lean();

    const claims = await Claim.find({ $text: { $search: text } })
      .populate('articleId').populate('addedBy')
      .limit(perPage)
      .skip(perPage * (page - 1));
    const transformedClaims = claims.map((x) => x.transform());

    const mergedClaims = await mergeClaimsWithReviews(transformedClaims, userReviews);
    res.json(mergedClaims);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Search artciles
 * @public
 */
exports.searchArticles = async (req, res, next) => {
  try {
    const { page, perPage, text } = req.query;

    const articles = await Article.find( // TODO similarity index
      { $text: { $search: text } },
      { score: { $meta: 'textScore' } },
    ).sort({ score: { $meta: 'textScore' } })
      .populate('addedBy')
      .limit(perPage)
      .skip(perPage * (page - 1));

    const savedArticles = await SavedArticle.find({ addedBy: req.user.id }).distinct('articleId').exec();
    const transformed = articles.map((x) => x.transform());
    transformed.forEach((x) => _.assign(x, { isSavedByUser: _.some(savedArticles, x._id) }));

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};
