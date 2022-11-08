// const { _ } = require('lodash');
const User = require('../models/user.model');
const Article = require('../models/article.model');
const Claim = require('../models/claim.model');
const Rating = require('../models/rating.model');
// const APIError = require('../errors/api-error');

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

    const ratings = await Rating
      .aggregate()
      .group({ _id: '$userId', count: { $sum: 1 } })
      .unwind('_id')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ count: 'desc' });

    const users = await User.find().where('_id').in(ratings).exec();
    res.json(users);
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

    const ratings = await Rating
      .aggregate()
      .group({ _id: '$articleId', count: { $sum: 1 } })
      .unwind('_id')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ count: 'desc' });

    const articles = await Article.find().where('_id').in(ratings).exec();
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

    const ratings = await Rating
      .aggregate()
      .group({ _id: '$claimId', count: { $sum: 1 } })
      .unwind('_id')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ count: 'desc' });

    const claims = await Claim.find().where('_id').in(ratings).exec();
    res.json(claims);
  } catch (error) {
    next(error);
  }
};
