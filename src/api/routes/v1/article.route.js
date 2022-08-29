const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/article.controller');
const claimRoutes = require('./claim.route');
const { authorize } = require('../../middlewares/auth');
const {
  listArticles,
  createArticle,
  replaceArticle,
  updateArticle,
} = require('../../validations/article.validation');

const router = express.Router({ mergeParams: true });

/**
 * Load article when API with articleId route parameter is hit
 */
router.param('articleId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/articles List Articles
   * @apiDescription Get a list of articles
   * @apiVersion 1.0.0
   * @apiName ListArticles
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  TODO
   *
   * @apiSuccess {Object[]} articles List of articles.
   */
  .get(validate(listArticles), controller.list)
  /**
   * @api {post} v1/articles Create Article
   * @apiDescription Create a new article
   * @apiVersion 1.0.0
   * @apiName CreateArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  TODO
   *
   * @apiSuccess TODO
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createArticle), controller.create);

router
  .route('/:articleId')
  /**
   * @api {get} v1/articles/:id Get Article
   * @apiDescription Get article information
   * @apiVersion 1.0.0
   * @apiName GetArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess TODO
   *
   * @apiError (Not Found 404)    NotFound     Article does not exist
   */
  .get(controller.get)
  /**
   * @api {put} v1/articles/:id Replace Article
   * @apiDescription Replace the whole article document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  TODO
   *
   * @apiSuccess TODO
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     Article does not exist
   */
  .put(authorize(), validate(replaceArticle), controller.replace)
  /**
   * @api {patch} v1/articles/:id Update Article
   * @apiDescription Update some fields of a article document
   * @apiVersion 1.0.0
   * @apiName UpdateArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  TODO
   *
   * @apiSuccess TODO
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     Article does not exist
   */
  .patch(authorize(), validate(updateArticle), controller.update)
  /**
   * @api {patch} v1/articles/:id Delete Article
   * @apiDescription Delete an article
   * @apiVersion 1.0.0
   * @apiName DeleteArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Not Found 404)    NotFound      article does not exist
   */
  .delete(authorize(), controller.remove);

// include nested - Claim routes
router.use('/:articleId/claims', claimRoutes);

module.exports = router;
