// const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
const User = require('../models/user.model');
const Review = require('../models/review.model');
// const APIError = require('../errors/api-error');

const getClaimsStats = async (userId) => {
  const claims = await Claim
    .aggregate([{ $match: { addedBy: mongoose.Types.ObjectId(userId) } }])
    .group({
      _id: null,
      nPos: { $sum: '$nPositiveVotes' },
      nNeg: { $sum: '$nNegativeVotes' },
      total: { $sum: 1 },
    }).exec();

  if (claims.length <= 0 || !_.has(claims[0], 'nPos') || !_.has(claims[0], 'nNeg') || !_.has(claims[0], 'total')) {
    return {
      nNegativeVotes: 0,
      nPositiveVotes: 0,
      total: 0,
    };
  }

  return {
    nNegativeVotes: claims[0].nNeg,
    nPositiveVotes: claims[0].nPos,
    total: claims[0].total,
  };
};

const getReviewsStats = async (userId) => {
  const rev = await Review
    .aggregate([{ $match: { addedBy: mongoose.Types.ObjectId(userId) } }])
    .group({
      _id: null,
      nPos: { $sum: '$nPositiveVotes' },
      nNeg: { $sum: '$nNegativeVotes' },
      nNeut: { $sum: '$nNeutralVotes' },
      total: { $sum: 1 },
    }).exec();

  if (rev.length <= 0 || !_.has(rev[0], 'nPos') || !_.has(rev[0], 'nNeg') || !_.has(rev[0], 'total') || !_.has(rev[0], 'nNeut')) {
    return {
      nNeutralVotes: 0,
      nNegativeVotes: 0,
      nPositiveVotes: 0,
      total: 0,
    };
  }

  return {
    nNeutralVotes: rev[0].nNeut,
    nNegativeVotes: rev[0].nNeg,
    nPositiveVotes: rev[0].nPos,
    total: rev[0].total,
  };
};

const getSavedArticles = async (userId) => {
  const articles = await Article
    .aggregate([{ $match: { addedBy: mongoose.Types.ObjectId(userId) } }])
    .group({ _id: null, nSaved: { $sum: '$nSaved' }, total: { $sum: 1 } }).exec();

  if (articles.length <= 0 || !_.has(articles[0], 'total') || !_.has(articles[0], 'nSaved')) return 0;

  return { total: articles[0].total, nSaved: articles[0].nSaved };
};

/**
 * GET statistics about currently logged user
 * @public
 */
exports.getUserStats = async (req, res, next) => {
  try {
    let uId = req.user.id;
    let { user } = req;

    if (req.query.userId) {
      uId = req.query.userId;
      user = await User.findById(uId).exec();
    }

    const userStats = {
      user: user.transform(),
      claims: {},
      reviews: {},
      articles: {},
    };

    _.assign(userStats.articles, await getSavedArticles(uId));
    _.assign(userStats.claims, await getClaimsStats(uId));
    _.assign(userStats.reviews, await getReviewsStats(uId));

    res.json(userStats);
  } catch (error) {
    next(error);
  }
};

/**
 * GET leaderboard list
 * @public
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const claims = await Claim
      .aggregate()
      .group({
        _id: '$addedBy',
        nClaims: { $sum: 1 },
      })
      .lookup({
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      })
      .project({
        'user._id': 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.name': 1,
        'user.email': 1,
        'user.role': 1,
        'user.nReviews': 1,
        'user.nBeenVoted': 1,
        nClaims: 1,
      })
      .exec();

    const mappedClaims = [];

    claims.forEach((it) => {
      let newObj = it;
      if (it.user.length !== 0) {
        const usr = it.user[0];
        newObj = _.omit(newObj, ['user']);
        newObj.user = usr;
        newObj.nReviews = newObj.user.nReviews;
      } else {
        newObj.user = {};
      }
      newObj.score = newObj.nClaims + newObj.nReviews;

      mappedClaims.push(newObj);
    });

    res.json(mappedClaims);
  } catch (error) {
    next(error);
  }
};
