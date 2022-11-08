const httpStatus = require('http-status');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
const User = require('../models/user.model');
const Rating = require('../models/rating.model');
const APIError = require('../errors/api-error');

/**
 * POST Create new rating by user to
 * Either -> another user, article or claim
 * @public
 */
exports.voteFor = async (req, res, next) => {
  try {
    const { claimId, articleId, userId } = req.query;

    const rating = new Rating(_.assign(req.body, {
      ratedBy: req.user.id,
    }));

    let referencedExists = true;
    let alreadyExists = false;

    if (userId) {
      rating.userId = userId;
      referencedExists = await User.exists({ _id: userId });
      alreadyExists = await Rating.findOne({ addedBy: req.user.id, userId });
    } else if (articleId) {
      rating.articleId = articleId;
      referencedExists = await Article.exists({ _id: articleId });
      alreadyExists = await Rating.findOne({ addedBy: req.user.id, articleId });
    } else if (claimId) {
      rating.articleId = articleId;
      referencedExists = await Claim.exists({ _id: claimId });
      alreadyExists = await Rating.findOne({ addedBy: req.user.id, claimId });
    } else {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: 'Rating must be associated with either userId, articleId or claimId',
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
        status: httpStatus.BAD_REQUEST,
        message: 'Referenced id does not exists.',
      });
    }

    const savedRating = await rating.save();

    res.status(httpStatus.CREATED);
    res.json(savedRating.transform());
  } catch (error) {
    next(error);
  }
};
