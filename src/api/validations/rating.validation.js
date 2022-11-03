const Joi = require('joi');

module.exports = {

  // GET /v1/vote
  voteRoute: {
    query: {
      articleId: Joi.string().hex().length(24),
      claimId: Joi.string().hex().length(24),
      userId: Joi.string().hex().length(24),
    },
    body: {
      text: Joi.string().min(0).max(128),
      rating: Joi.number().min(-1).max(10).required(),
    },
  },
};
