const Joi = require('joi');

module.exports = {

  // GET /v1/save
  saveRoute: {
    query: {
      articleId: Joi.string().hex().length(24).required(),
    },
  },
};
