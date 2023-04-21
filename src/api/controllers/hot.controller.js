// const { _ } = require('lodash');
const User = require('../models/user.model');
const Article = require('../models/article.model');
const Claim = require('../models/claim.model');
// const SavedArticle = require('../models/savedArticle.model');
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

    const transformed = articles.map((x) => x.transform());
    // let savedArticles = [];

    // if (!_.isNil(req.user) && !_.isNil(req.user.id)) {
    //   savedArticles = await SavedArticle.find({ addedBy: req.user.id })
    //     .distinct('articleId').exec();
    // }

    // transformed.forEach((x) => {
    //   _.assign(x, { isSavedByUser: _.some(savedArticles, x._id) });
    // });

    res.json(transformed);
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
