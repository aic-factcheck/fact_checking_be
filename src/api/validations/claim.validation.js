const Joi = require('joi');
// const Claim = require('../models/claim.model');

module.exports = {

  // GET /v1/articles/:id/claims/
  listClaims: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },

  // POST /v1/articles/:id/claims/:claimId
  createClaim: {
    query: {
      claimId: Joi.string().hex().length(24),
    },
    body: {
      text: Joi.string().min(6).max(512).required(),
    },
  },

  // PUT /v1/articles/:id/claims/:claimId
  addExistingClaim: {
    // body: {
    // },
    // params: {
    // },
  },

  // PUT /v1/articles/:id/claims/:claimId
  replaceClaim: {
    // body: {
    // },
    // params: {
    // },
  },

  // PATCH /v1/articles/:id/claims/:claimId
  updateClaim: {
    // body: {
    // },
    // params: {
    // },
  },
};
