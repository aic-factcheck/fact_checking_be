// const { _ } = require('lodash');
const httpStatus = require('http-status');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
const User = require('../models/user.model');
const Vote = require('../models/vote.model');
const Review = require('../models/review.model');
const APIError = require('../errors/api-error');

exports.referencedObjExists = async (articleId, claimId, reviewId, userId) => {
  let docCount;

  if (articleId) {
    docCount = await Article.countDocuments({ _id: articleId });
  } else if (claimId) {
    docCount = await Claim.countDocuments({ _id: claimId });
  } else if (reviewId) {
    docCount = await Review.countDocuments({ _id: reviewId });
  } else if (userId) {
    docCount = await User.countDocuments({ _id: userId });
  }

  return docCount;
};

exports.unvote = async (articleId, claimId, reviewId, userId, addedBy) => {
  const oldVote = await Vote.findOneAndDelete({
    addedBy,
    articleId,
    claimId,
    reviewId,
    userId,
  }).exec();

  if (!oldVote) return;

  let nPositiveVotes = 0;
  let nNegativeVotes = 0;
  let nNeutralVotes = 0;

  if (oldVote.rating === 1) nPositiveVotes = -1;
  if (oldVote.rating === 0) nNeutralVotes = -1;
  if (oldVote.rating === -1) nNegativeVotes = -1;

  if (userId) {
    await User.findOneAndUpdate({ _id: userId }, {
      $inc: { nBeenVoted: -1, nPositiveVotes, nNegativeVotes },
    }, {
      returnDocument: 'after',
    }).exec();
  } else if (articleId) {
    await Article.findOneAndUpdate({ _id: articleId }, {
      $inc: { nBeenVoted: -1, nPositiveVotes, nNegativeVotes },
    }, {
      returnDocument: 'after',
    }).exec();
  } else if (claimId) {
    await Claim.findOneAndUpdate({ _id: claimId }, {
      $inc: { nBeenVoted: -1, nPositiveVotes, nNegativeVotes },
    }, {
      returnDocument: 'after',
    }).exec();
  } else if (reviewId) {
    await Review.findOneAndUpdate({ _id: reviewId }, {
      $inc: {
        nBeenVoted: -1,
        nPositiveVotes,
        nNegativeVotes,
        nNeutralVotes,
      },
    }, {
      returnDocument: 'after',
    }).exec();
  }
};

exports.vote = async (articleId, claimId, reviewId, userId, addedBy, rating) => {
  let res;
  const vote = new Vote({ addedBy, rating });

  let nPositiveVotes = 0;
  let nNegativeVotes = 0;
  let nNeutralVotes = 0;
  const nBeenVoted = 1;
  if (rating === 1) nPositiveVotes = 1;
  if (rating === 0) nNeutralVotes = 1;
  if (rating === -1) nNegativeVotes = 1;

  if (userId) {
    vote.userId = userId;
    res = await User.findOneAndUpdate({ _id: userId }, {
      $inc: { nBeenVoted, nPositiveVotes, nNegativeVotes },
    }, {
      returnDocument: 'after',
    }).exec();
  } else if (articleId) {
    vote.articleId = articleId;
    res = await Article.findOneAndUpdate({ _id: articleId }, {
      $inc: { nBeenVoted, nPositiveVotes, nNegativeVotes },
    }, {
      returnDocument: 'after',
    }).exec();
  } else if (claimId) {
    vote.claimId = claimId;
    res = await Claim.findOneAndUpdate({ _id: claimId }, {
      $inc: { nBeenVoted, nPositiveVotes, nNegativeVotes },
    }, {
      returnDocument: 'after',
    }).exec();
  } else if (reviewId) {
    vote.reviewId = reviewId;
    res = await Review.findOneAndUpdate({ _id: reviewId }, {
      $inc: {
        nBeenVoted,
        nPositiveVotes,
        nNegativeVotes,
        nNeutralVotes,
      },
    }, {
      returnDocument: 'after',
    }).exec();
  } else {
    throw new APIError({
      message: 'Referenced object does not exist.',
      status: httpStatus.BAD_REQUESTS,
    });
  }

  await vote.save();
  return res;
};
