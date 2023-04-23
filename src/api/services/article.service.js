const { _ } = require('lodash');
const Article = require('../models/article.model');
const SavedArticle = require('../models/savedArticle.model');

/**
* List articles by query in selected order, populate and add fields
*
* @param {number} skip - Number of articles to be skipped.
* @param {number} limit - Limit number of articles to be returned.
* @param {Object} query - Object of Mongo query.
* @param {String} addedBy - Object for sorting the list.
* @param {Object} sortBy - Object for sorting the list.
* @returns {Promise<Article[]>}
*/
exports.listArticles = async ({
  page = 1, perPage = 20, query = {}, loggedUserId = null, sortBy = { createdAt: -1 },
}) => {
  const articles = await Article.find(query)
    .populate('addedBy')
    .sort(sortBy)
    .skip(perPage * (page - 1))
    .limit(perPage)
    .exec();

  let savedArticles = [];

  if (loggedUserId) {
    savedArticles = await SavedArticle.find({ addedBy: loggedUserId }).distinct('articleId').exec();
  }

  articles.forEach((x) => {
    _.assign(x, { isSavedByUser: _.some(savedArticles, x._id) });
  });

  const transformed = articles.map((x) => x.transform());
  return transformed;
};
