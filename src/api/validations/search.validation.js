const Joi = require('joi');

module.exports = {

  // GET /v1/search/claims
  searchClaims: {
    query: {
      text: Joi.string()
        .min(3).max(512)
        // .alphanum()
        .required(),
    },
  },

  // GET /v1/search/articles
  searchArticles: {
    query: {
      text: Joi.string()
        .min(3).max(512)
        // .alphanum()
        .required(),
    },
  },
};
