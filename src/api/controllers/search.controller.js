// const httpStatus = require('http-status');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const User = require('../models/user.model');
const Article = require('../models/article.model');
const SavedArticle = require('../models/savedArticle.model');

/**
 * GET search for user-name
 * @public
 */
exports.searchUsers = async (req, res, next) => {
  try {
    const { text } = req.query;
    const claims = await User.find({
      $text: {
        $search: text,
        $diacriticSensitive: false,
      },
    });

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
    const { text } = req.query;
    const claims = await Claim.find({
      $text: {
        $search: text,
      },
    });

    res.json(claims);
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

    const savedArticles = await SavedArticle.find({ addedBy: req.user.id })
      .distinct('articleId').exec();
    const transformed = articles.map((x) => x.transform());
    transformed.forEach((x) => {
      _.assign(x, { isSavedByUser: _.some(savedArticles, x._id) });
    });

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};
