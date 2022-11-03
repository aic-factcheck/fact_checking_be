const Joi = require('joi');

module.exports = {

  // GET /v1/search/claims
  searchClaims: {
    query: {
      text: Joi.string().min(3).max(512),
    },
    // body: {
    // },
  },
};
