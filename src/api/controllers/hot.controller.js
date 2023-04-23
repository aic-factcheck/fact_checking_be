// const { _ } = require('lodash');
const User = require('../models/user.model');
const articleService = require('../services/article.service');
const Claim = require('../models/claim.model');
// const { mergeClaimsWithReviews } = require('../utils/helpers/mergeReviewsClaims');

/**
 * Get list of hottest users
 * @public
 */
exports.hottestUsers = async (req, res, next) => {
  try {
    let page = 1;
    let perPage = 20;
    if (req.page) {
      page = req.page;
    }
    if (req.perPage) {
      perPage = req.perPage;
    }

    const users = await User.find()
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ nBeenVoted: 'desc' })
      .exec();

    const transUsers = users.map((x) => x.transform());
    res.json(transUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of hottest articles
 * @public
 */
exports.hottestArticles = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const query = { page, perPage, sortBy: { nBeenVoted: 'desc' } };

    const articles = await articleService.listArticles(query);
    res.json(articles);
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of hottest claims
 * @public
 */
exports.hottestClaims = async (req, res, next) => {
  try {
    let page = 1;
    let perPage = 20;
    if (req.page) {
      page = req.page;
    }
    if (req.perPage) {
      perPage = req.perPage;
    }
    // const userReviews = await Review.find({ addedBy: req.user.id }).lean();

    const claims = await Claim.find()
      .populate('addedBy')
      .populate('articleId')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ nBeenVoted: 'desc' })
      .exec();
    const transformed = claims.map((x) => x.transform());

    // const mergedClaims = await mergeClaimsWithReviews(transformed, userReviews);
    res.json(transformed);
  } catch (error) {
    next(error);
  }
};
