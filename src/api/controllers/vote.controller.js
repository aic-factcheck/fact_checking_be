const httpStatus = require('http-status');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
const User = require('../models/user.model');
const Vote = require('../models/vote.model');
const Review = require('../models/review.model');
const APIError = require('../errors/api-error');

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

    const vote = new Vote(_.assign(req.body, {
      addedBy: req.user.id,
    }));

    let referencedExists = true;
    let alreadyExists = false;

    if (userId) {
      vote.userId = userId;
      referencedExists = await User.exists({ _id: userId });
      alreadyExists = await Vote.findOne({ addedBy: req.user.id, userId });
    } else if (articleId) {
      vote.articleId = articleId;
      referencedExists = await Article.exists({ _id: articleId });
      alreadyExists = await Vote.findOne({ addedBy: req.user.id, articleId });
    } else if (claimId) {
      vote.claimId = claimId;
      referencedExists = await Claim.exists({ _id: claimId });
      alreadyExists = await Vote.findOne({ addedBy: req.user.id, claimId });
    } else if (reviewId) {
      vote.reviewId = reviewId;
      referencedExists = await Review.exists({ _id: reviewId });
      alreadyExists = await Vote.findOne({ addedBy: req.user.id, reviewId });
    } else {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: 'Vote must be associated with either userId, articleId or claimId',
      });
    }

    if (alreadyExists) {
      throw new APIError({
        status: httpStatus.CONFLICT,
        message: 'Already voted.',
      });
    }

    if (!referencedExists) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: 'Referenced id does not exists.',
      });
    }

    const savedVote = await vote.save();

    if (userId) {
      await User.findOneAndUpdate({ _id: userId }, { $inc: { nBeenVoted: 1 } }).exec();
    } else if (articleId) {
      await Article.findOneAndUpdate({ _id: articleId }, { $inc: { nBeenVoted: 1 } }).exec();
    } else if (claimId) {
      if (savedVote.rating === -1) {
        await Claim.findOneAndUpdate(
          { _id: claimId },
          { $inc: { nNegativeVotes: 1, nBeenVoted: 1 } },
        ).exec();
      } else if (savedVote.rating === 1) {
        await Claim.findOneAndUpdate(
          { _id: claimId },
          { $inc: { nPositiveVotes: 1, nBeenVoted: 1 } },
        ).exec();
      }
    } else if (reviewId) {
      if (savedVote.rating === -1) {
        await Review.findOneAndUpdate(
          { _id: reviewId },
          { $inc: { nNegativeVotes: 1, nBeenVoted: 1 } },
        ).exec();
      } else if (savedVote.rating === 1) {
        await Review.findOneAndUpdate(
          { _id: reviewId },
          { $inc: { nPositiveVotes: 1, nBeenVoted: 1 } },
        ).exec();
      } else if (savedVote.rating === 0) {
        await Review.findOneAndUpdate(
          { _id: reviewId },
          { $inc: { nNeutralVotes: 1, nBeenVoted: 1 } },
        ).exec();
      }
    }

    res.status(httpStatus.CREATED);
    res.json(savedVote.transform());
  } catch (error) {
    next(error);
  }
};
