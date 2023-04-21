const httpStatus = require('http-status');
const { _ } = require('lodash');
const APIError = require('../errors/api-error');
const service = require('../services/vote.service');

/**
 * POST Create new vote by user to
 * Either -> another user, article or claim
 * @public
 */
exports.voteFor = async (req, res, next) => {
  try {
    const addedBy = req.user.id;
    const { rating } = req.body;
    const {
      claimId, articleId, userId, reviewId,
    } = req.query;

    if (_.isNil(claimId) && _.isNil(articleId) && _.isNil(reviewId) && _.isNil(userId)) {
      throw new APIError({
        message: 'ArticleId, claimId, reviewId or userId must be specified',
        status: httpStatus.BAD_REQUEST,
      });
    }

    if (await service.referencedObjExists(articleId, claimId, reviewId, userId) === 0) {
      throw new APIError({
        message: 'Referenced object not found',
        status: httpStatus.NOT_FOUND,
      });
    }

    await service.unvote(articleId, claimId, reviewId, userId, req.user.id);

    const obj = await service.vote(articleId, claimId, reviewId, userId, addedBy, rating);

    res.status(httpStatus.CREATED);
    res.json(obj.transform());
  } catch (error) {
    next(error);
  }
};
