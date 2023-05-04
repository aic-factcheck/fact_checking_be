const User = require('../models/user.model');
const articleService = require('../services/article.service');
const claimService = require('../services/claim.service');

/**
 * Get list of hottest users
 * @public
 */
exports.hottestUsers = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;

    const users = await User.find()
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ nBeenVoted: 'desc' })
      .exec();

    const transformed = users.map((x) => x.transform());
    res.json(transformed);
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
    const query = {
      page: req.query.page,
      perPage: req.query.perPage,
      sortBy: { nBeenVoted: 'desc' },
      loggedUserId: req.user.id,
    };

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
    const query = { page: req.query.page, perPage: req.query.perPage, sortBy: { nPositiveVotes: 'desc', createdAt: 'desc' } };
    const claims = await claimService.listClaims(query);
    res.json(claims);
  } catch (error) {
    next(error);
  }
};
