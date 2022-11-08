// const { _ } = require('lodash');
// const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
const User = require('../models/user.model');
// const Rating = require('../models/rating.model');
// const APIError = require('../errors/api-error');

/**
 * Get list of hottest users
 * @public
 */
exports.hottestUsers = async (req, res, next) => {
  try {
    const users = await User.aggregate(
      [{
        $group: {
          _id: '$users',
          numOfRatings: { $sum: 1 },
        },
      }],
    );
    // const userss = await User.aggregate().group({ _id: '$userId' });
    console.log(users);
    res.json('Dummy');
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
    const articles = await Article.aggregate(
      [{
        $group: {
          _id: '$articleId',
          count: { $sum: 1 },
        },
      }], (err, results) => {
        console.log(results);
      },
    );
    // const userss = await User.aggregate().group({ _id: '$userId' });
    console.log(articles);
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
    res.json('Dummy');
  } catch (error) {
    next(error);
  }
};
