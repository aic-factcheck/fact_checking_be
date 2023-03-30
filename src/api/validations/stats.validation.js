const Joi = require('joi');

module.exports = {

  // GET /v1/stats
  userStats: {
    query: {
      userId: Joi.string().hex().length(24),
    },
  },
};
