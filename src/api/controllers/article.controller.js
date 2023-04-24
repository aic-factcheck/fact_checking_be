const { _ } = require('lodash');
const httpStatus = require('http-status');
const User = require('../models/user.model');
const Article = require('../models/article.model');
const SavedArticle = require('../models/savedArticle.model');
const APIError = require('../errors/api-error');

const checkIsOwnerOfResurce = require('../utils/helpers/resourceOwner');
const articleService = require('../services/article.service');

/**
 * Load article and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const article = await Article.get(id);
    req.locals = _.assign(req.locals, { article });
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get article
 * @public
 */
exports.get = async (req, res, next) => {
  try {
    const addedBy = req.user.id;
    const articleId = req.locals.article._id;

    const savedArticleCnt = await SavedArticle.find({ addedBy, articleId }).countDocuments();
    const article = req.locals.article.transform();

    article.isSavedByUser = (savedArticleCnt >= 1);
    res.json(article);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new article
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const article = new Article(_.assign(req.body, { addedBy: req.user.id }));
    const savedArticle = await article.save();
    await User.addExp(req.user.id, 'createArticle');

    res.status(httpStatus.CREATED);
    res.json(savedArticle.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Replace existing article
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { article } = req.locals;
    const newArticle = new Article(req.body);

    await checkIsOwnerOfResurce(article.addedBy._id, req);

    const newArticleObject = _.omit(newArticle.toObject(), ['_id']);
    await article.updateOne(newArticleObject, { override: true, upsert: true });
    const savedArticle = await Article.get(article._id);

    res.json(savedArticle.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing article
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const { article } = req.locals;
    await checkIsOwnerOfResurce(article.addedBy._id, req);

    const newArticle = Object.assign(req.locals.article, req.body);

    newArticle.save()
      .then((savedArticle) => res.json(savedArticle.transform()))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

/**
 * Get article list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const query = { page: req.query.page, perPage: req.query.perPage, loggedUserId: req.user.id };

    const articles = await articleService.listArticles(query);
    res.json(articles);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete article
 * @public
 */
exports.remove = async (req, res, next) => {
  try {
    const { article } = req.locals;
    await checkIsOwnerOfResurce(article.addedBy._id, req);

    article.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.saveByUser = async (req, res, next) => {
  try {
    const addedBy = req.user.id;
    const { articleId } = req.query;

    const articleCnt = await Article.findById(articleId).countDocuments();
    const alreadySaved = await SavedArticle.findOne({ addedBy, articleId }).countDocuments();

    if (alreadySaved !== 0) {
      throw new APIError({ status: httpStatus.BAD_REQUEST, message: 'Article already saved' });
    }

    if (articleCnt < 1) {
      throw new APIError({ status: httpStatus.BAD_REQUEST, message: 'ArticleId not valid' });
    }

    await Article.findOneAndUpdate({ _id: articleId }, { $inc: { nSaved: 1 } }).exec();
    const newArticle = new SavedArticle({ addedBy, articleId });
    const savedArticle = await newArticle.save();

    res.status(httpStatus.CREATED);
    res.json(savedArticle.transform());
  } catch (error) {
    next(error);
  }
};

exports.unsaveByUser = async (req, res, next) => {
  try {
    const { articleId } = req.query;
    await Article.findOneAndUpdate({ _id: articleId }, { $inc: { nSaved: -1 } }).exec();

    await SavedArticle.remove({ addedBy: req.user.id, articleId })
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

/**
 * Get saved article list of current user
 * @public
 */
exports.listSaved = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const savedArticles = await SavedArticle.find({ addedBy: req.user.id })
      .distinct('articleId').exec();

    const articles = await Article
      .where('_id')
      .in(savedArticles)
      .populate('addedBy')
      .limit(perPage)
      .skip(perPage * (page - 1));

    const transformedArticles = articles.map((x) => x.transform());
    res.json(transformedArticles);
  } catch (error) {
    next(error);
  }
};
