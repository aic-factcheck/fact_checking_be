const httpStatus = require('http-status');
const { _ } = require('lodash');
const Article = require('../models/article.model');
const User = require('../models/user.model');
const APIError = require('../errors/api-error');
const { checkIsOwnerOfResurce } = require('../utils/helpers/resourceOwner');

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
exports.get = (req, res) => res.json(req.locals.article.transform());

/**
 * Create new article
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const article = new Article(_.assign(req.body, { addedBy: req.user.id }));
    const savedArticle = await article.save();
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
    const { page, perPage } = req.query;
    const articles = await Article.find().populate('addedBy').limit(perPage).skip(perPage * (page - 1));
    const trans = articles.map((x) => x.transform());
    trans.forEach((x) => {
      _.assign(x, { isSavedByUser: req.user.savedArticles.includes(x._id) });
    });

    res.json(trans);
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
    const userId = req.user.id;
    const { articleId } = req.query;

    const articleCnt = await Article.findById(articleId).count();

    if (req.user.savedArticles.includes(articleId)) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: 'Article already saved',
      });
    }

    if (articleCnt < 1) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: 'ArticleId not valid',
      });
    }

    await User.findOneAndUpdate({ _id: userId }, {
      $push: { savedArticles: articleId },
    }).exec();

    const resUser = await User.findById(userId);
    res.status(httpStatus.CREATED);
    res.json(resUser.transform());
  } catch (error) {
    next(error);
  }
};

exports.unsaveByUser = async (req, res, next) => {
  try {
    const { articleId } = req.query;

    await User.findOneAndUpdate({ _id: req.user.id }, {
      $pull: { savedArticles: articleId },
    }).exec();

    res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
};
