const Joi = require('joi');
const Article = require('../models/article.model');

module.exports = {

  // GET /v1/articles
  listArticles: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },

  // POST /v1/articles
  createArticle: {
    body: {
      title: Joi.string().min(6).max(512).required(),
      text: Joi.string().min(6).max(16448).required(),
      sourceUrl: Joi.string().max(256),
      sourceType: Joi.string().valid(Article.articleTypes).required(),
      language: Joi.string().valid(Article.languages).required(),
    },
  },

  // PUT /v1/articles/:articleId
  replaceArticle: {
    body: {
      text: Joi.string().min(6).max(16448).required(),
      sourceUrl: Joi.string().max(256),
      sourceType: Joi.string().valid(Article.articleTypes).required(),
      language: Joi.string().valid(Article.languages).required(),
    },
    params: {
      articleId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /v1/articles/:articleId
  updateArticle: {
    // body: {
    // },
    // params: {
    // },
  },
};
