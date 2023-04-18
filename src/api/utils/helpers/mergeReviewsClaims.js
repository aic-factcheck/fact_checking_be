const { _ } = require('lodash');
/*
 * Takes `claims` array and logged user array of `reviews`
 * returns new array of merged claims with user's review for each claim
 */
exports.mergeClaimsWithReviews = async (claims, reviews) => {
  const mergedClaims = claims.map((claim) => {
    const userReview = _.find(reviews, { claimId: claim._id });

    const mergedClaim = _.assign(claim, { userReview });
    if (userReview) {
      mergedClaim.userReview = userReview.vote;
    } else {
      mergedClaim.userReview = null;
    }
    return mergedClaim;
  });

  return mergedClaims;
};
