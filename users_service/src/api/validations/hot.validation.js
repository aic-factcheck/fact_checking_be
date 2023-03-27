const Joi = require('joi');

module.exports = {

  // GET /v1/hot/users
  listHotUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },

  // GET /v1/hot/articles
  listHotArticles: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },

  // GET /v1/hot/claims
  listHotClaims: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },
};
