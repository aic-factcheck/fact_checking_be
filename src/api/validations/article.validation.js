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
      text: Joi.string().min(6).max(16448).required(),
      sourceUrl: Joi.string().max(128),
      sourceType: Joi.string().valid(Article.articleTypes).required(),
      language: Joi.string().valid(Article.languages).required(),
    },
  },

  // PUT /v1/articles/:articleId
  replaceArticle: {
    // body: {
    // },
    // params: {
    // },
  },

  // PATCH /v1/articles/:articleId
  updateArticle: {
    // body: {
    // },
    // params: {
    // },
  },
};