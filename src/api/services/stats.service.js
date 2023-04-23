// const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
// const User = require('../models/user.model');
const Review = require('../models/review.model');

exports.getClaimsStats = async (userId) => {
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

exports.getReviewsStats = async (userId) => {
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

exports.getSavedArticles = async (userId) => {
  const articles = await Article
    .aggregate([{ $match: { addedBy: mongoose.Types.ObjectId(userId) } }])
    .group({ _id: null, nSaved: { $sum: '$nSaved' }, total: { $sum: 1 } }).exec();

  if (articles.length <= 0 || !_.has(articles[0], 'total') || !_.has(articles[0], 'nSaved')) return { total: 0, nSaved: 0 };

  return { total: articles[0].total, nSaved: articles[0].nSaved };
};
