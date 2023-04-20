const httpStatus = require('http-status');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
const User = require('../models/user.model');
const Vote = require('../models/vote.model');
const Review = require('../models/review.model');
const APIError = require('../errors/api-error');

const removeOldVoteIfExists = async (articleId, claimId, reviewId, userId, addedBy) => {
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

const createVote = async (articleId, claimId, reviewId, userId, addedBy, rating) => {
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

const doesReferencedExist = async (articleId, claimId, reviewId, userId) => {
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

/**
 * POST Create new vote by user to
 * Either -> another user, article or claim
 * @public
 */
exports.voteFor = async (req, res, next) => {
  try {
    const {
      claimId, articleId, userId, reviewId,
    } = req.query;

    if (_.isNil(claimId) && _.isNil(articleId) && _.isNil(reviewId) && _.isNil(userId)) {
      throw new APIError({
        message: 'ArticleId, claimId, reviewId or userId must be specified',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const refCount = await doesReferencedExist(articleId, claimId, reviewId, userId);
    if (refCount === 0) {
      throw new APIError({
        message: 'Referenced object not found',
        status: httpStatus.NOT_FOUND,
      });
    }

    await removeOldVoteIfExists(articleId, claimId, reviewId, userId, req.user.id);

    const r = await createVote(articleId, claimId, reviewId, userId, req.user.id, req.body.rating);
    // const r = await Review.findById(reviewId);
    res.status(httpStatus.CREATED);
    res.json(r.transform());
  } catch (error) {
    next(error);
  }
};
