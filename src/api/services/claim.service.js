// const { _ } = require('lodash');
const Claim = require('../models/claim.model');
// const { mergeClaimsWithReviews } = require('../utils/helpers/mergeReviewsClaims');

/**
* List claims by query in selected order, populate and add fields
*
* @param {number} skip - Number of claims to be skipped.
* @param {number} limit - Limit number of claims to be returned.
* @param {Object} query - Object of Mongo query.
* @param {Object} sortBy - Object for sorting the list.
* @returns {Promise<Claim[]>}
*/
exports.listClaims = async ({
  page = 1, perPage = 20, query = {}, sortBy = { createdAt: -1 },
}) => {
  const claims = await Claim.find(query)
    .populate('addedBy')
    .populate('articleId')
    .sort(sortBy)
    .skip(perPage * (page - 1))
    .limit(perPage)
    .exec();

  const transformed = claims.map((x) => x.transform());

  // const userReviews = await Review.find({ addedBy: req.user.id }).lean();
  // const transformed = claims.map((it) => {
  //   const x = it.transform();
  //   return x;
  // });

  return transformed;
};
