// const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { _ } = require('lodash');
const Claim = require('../models/claim.model');
const Article = require('../models/article.model');
const User = require('../models/user.model');
// const Review = require('../models/review.model');
const service = require('../services/stats.service');

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

    // const savedArticles = await getSavedArticles(uId);
    // if (!_.isNil(savedArticles)) _.assign(userStats.articles, savedArticles);
    _.assign(userStats.articles, await service.getSavedArticles(uId));
    _.assign(userStats.claims, await service.getClaimsStats(uId));
    _.assign(userStats.reviews, await service.getReviewsStats(uId));

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
    const { page, perPage } = req.query;

    const users = await User.find()
      .sort({ nReviews: -1 })
      .limit(perPage)
      .skip(perPage * (page - 1));
    const userIds = users.map((el) => mongoose.Types.ObjectId(el.id));

    const articles = await Article
      .aggregate([{ $match: { addedBy: { $in: userIds } } }])
      .group({ _id: '$addedBy', nArticles: { $sum: 1 } })
      .exec();
    const claims = await Claim
      .aggregate([{ $match: { addedBy: { $in: userIds } } }])
      .group({ _id: '$addedBy', nClaims: { $sum: 1 } })
      .exec();

    const transformedUsers = users.map((x) => {
      const newEl = x.transform();
      newEl.nArticles = 0;
      newEl.nClaims = 0;
      if (_.isNil(newEl.name)) newEl.name = `${newEl.firstName} ${newEl.lastName}`;
      return newEl;
    });
    const merged = _.merge(_.keyBy(transformedUsers, 'id'), _.keyBy(articles, '_id'), _.keyBy(claims, '_id'));
    const values = _.values(merged);

    res.json(values);
  } catch (error) {
    next(error);
  }
};
