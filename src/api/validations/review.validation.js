const Joi = require('joi');
const Review = require('../models/review.model');

module.exports = {

  // GET /v1/articles/:id/claims/:claimId/reviews
  listReviews: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },

  // POST /v1/articles/:id/claims/:claimId/reviews
  createReview: {
    body: {
      text: Joi.string().min(6).max(512).required(),
      vote: Joi.string().valid(Review.voteTypes).required(),
    },
  },

  // PUT /v1/articles/:id/claims/:claimId/reviews/:reviewId
  replaceReview: {
    // body: {
    // },
    // params: {
    // },
  },

  // PATCH /v1/articles/:id/claims/:claimId/reviews/:reviewId
  updateReview: {
    // body: {
    // },
    // params: {
    // },
  },
};
