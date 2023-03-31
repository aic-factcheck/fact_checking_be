const Joi = require('joi');

module.exports = {

  // GET /v1/stats
  userStats: {
    query: {
      userId: Joi.string().hex().length(24),
    },
  },

  // GET /v1/stats/leaderboard
  usersLeaderboard: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },
};
