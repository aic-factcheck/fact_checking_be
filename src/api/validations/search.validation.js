const Joi = require('joi');

module.exports = {

  // GET /v1/search/users
  searchUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      text: Joi.string()
        .min(3).max(56)
        // .alphanum()
        .required(),
    },
  },

  // GET /v1/search/claims
  searchClaims: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      text: Joi.string()
        .min(3).max(512)
        // .alphanum()
        .required(),
    },
  },

  // GET /v1/search/articles
  searchArticles: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      text: Joi.string()
        .min(3).max(512)
        // .alphanum()
        .required(),
    },
  },
};
