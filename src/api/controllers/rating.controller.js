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

    // const rating = new Rating({ addedBy: req.user.id });
    const rating = new Rating(_.assign(req.body, {
      ratedBy: req.user.id,
    }));
    let exists = true;

    // TODO check if referenced object exists ... article/claim/user
    if (userId) {
      rating.userId = userId;
      exists = await User.exists({ _id: userId });
    } else if (articleId) {
      rating.articleId = articleId;
      exists = await Article.exists({ _id: articleId });
    } else if (claimId) {
      rating.articleId = articleId;
      exists = await Claim.exists({ _id: claimId });
    } else {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: 'Rating must be associated with either userId, articleId or claimId',
      });
    }

    if (!exists) {
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
