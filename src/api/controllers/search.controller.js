// const httpStatus = require('http-status');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');

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
    const { text } = req.query;

    const articles1 = await Article.find( // TODO similarity index
      { $text: { $search: text } },
      { score: { $meta: 'textScore' } },
    ).sort({ score: { $meta: 'textScore' } });

    console.log(articles1[0]);

    const articles = await Article.find({
      $text: {
        $search: text,
      },
    });

    res.json(articles);
  } catch (error) {
    next(error);
  }
};
