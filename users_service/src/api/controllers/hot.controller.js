// const { _ } = require('lodash');
const User = require('../models/user.model');
const Article = require('../models/article.model');
const Claim = require('../models/claim.model');

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
    let page = 1;
    let perPage = 20;
    if (req.page) {
      page = req.page;
    }
    if (req.perPage) {
      perPage = req.perPage;
    }

    const articles = await Article.find()
      .skip(perPage * (page - 1))
      .populate('addedBy')
      .limit(perPage)
      .sort({ nBeenVoted: 'desc' })
      .exec();

    const transArticles = articles.map((x) => x.transform());
    res.json(transArticles);
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

    const claims = await Claim.find()
      .skip(perPage * (page - 1))
      .populate('addedBy')
      .populate('articleId')
      .limit(perPage)
      .sort({ nBeenVoted: 'desc' })
      .exec();

    const transClaims = claims.map((x) => x.transform());
    res.json(transClaims);
  } catch (error) {
    next(error);
  }
};
