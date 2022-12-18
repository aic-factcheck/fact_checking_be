// const { _ } = require('lodash');
const { _ } = require('lodash');
const User = require('../models/user.model');
const Article = require('../models/article.model');
const Claim = require('../models/claim.model');
const Vote = require('../models/vote.model');
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

    const votes = await Vote
      .aggregate()
      .group({ _id: '$userId', count: { $sum: 1 } })
      .unwind('_id')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ count: 'desc' });

    const users = await User.find().where('_id').in(votes).exec();
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

    const votes = await Vote
      .aggregate()
      .group({ _id: '$articleId', count: { $sum: 1 } })
      .unwind('_id')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ count: 'desc' });
    console.log(votes);

    const articles = await Article.find()
      .where('_id').in(votes).lean()
      .exec();

    const articleWithVotes = articles.map((it) => {
      const vote = votes.find((x) => _.isEqual(x._id, it._id));
      return _.assign({ votes: vote.count }, it);
    });

    let addedArticles;
    // always return at lest 'pegPage' articles .. even when there are no votes
    if (votes.length < perPage) {
      addedArticles = await Article.find({
        _id: {
          $nin: votes.map((it) => it._id),
        },
      }).skip(perPage * (page - 1))
        .lean()
        .limit(perPage - votes.length)
        .exec();
      addedArticles = addedArticles.map((it) => _.assign({ votes: 0 }, it));
    }

    res.json(articleWithVotes.concat(addedArticles)); // merge the arrays
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
