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
  listSavedArticles,
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
   * @apiQuery  {Number{1-}}         [page=1]     List page (optional)
   * @apiQuery  {Number{1-100}}      [perPage=1]  Users per page (optional)
   *
   * @apiSuccess {Object[]} articles List of articles.
   */
  .get(authorize(), validate(listArticles), controller.list)
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
   * @apiBody  {String{6..16448}}                text          Article text
   * @apiBody  {String{..128}}                   sourceUrl     SorceUrl of article
   * @apiBody  {String=article,tv,radio,other}   sourceType    Source type of article
   * @apiBody  {String=cz,sk,en}                 lang      Article language
   *
   * @apiSuccess (Created 201) {String}  _id            Article id
   * @apiSuccess (Created 201) {String}  addedBy        Id of user who added the article
   * @apiSuccess (Created 201) {String}  text           Text of article
   * @apiSuccess (Created 201) {String}  sourceUrl      Source url of article
   * @apiSuccess (Created 201) {String}  sourceType     Source type of article
   * @apiSuccess (Created 201) {String}  lang       Language of article
   * @apiSuccess (Created 201) {String}  nBeenVoted     Number of votes
   * @apiSuccess (Created 201) {String}  nSaved         Number of saves
   * @apiSuccess (Created 201) {Date}    createdAt      Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createArticle), controller.create);

router.route('/saved')
  /**
   * @api {get} v1/articles/saved List saved Articles
   * @apiDescription Get a list of saved articles
   * @apiVersion 1.0.0
   * @apiName ListSavedArticles
   * @apiGroup SavedArticles
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {Number{1-}}         [page=1]     List page (optional)
   * @apiQuery  {Number{1-100}}      [perPage=1]  Users per page (optional)
   *
   * @apiSuccess {Object[]} articles List of articles.
   */
  .get(authorize(), validate(listSavedArticles), controller.listSaved);

router
  .route('/:articleId')
  /**
   * @api {get} v1/articles/:articleId Get Article
   * @apiDescription Get article information
   * @apiVersion 1.0.0
   * @apiName GetArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} articleId   ArticleId
   *
   * @apiSuccess {String}  _id            Article's id
   * @apiSuccess {Object}  addedBy        User object who added the article
   * @apiSuccess {String}  text           Text of article
   * @apiSuccess {String}  sourceUrl      Source url of article
   * @apiSuccess {String}  sourceType     Source type of article
   * @apiSuccess {Boolean} isSavedByUser  Is article saved by current user
   * @apiSuccess {String}  lang           Language of article
   * @apiSuccess {String}  nBeedVoted     Number of votes for this article
   * @apiSuccess {String}  nSaved         Number of user who saved this article
   * @apiSuccess {Date}    createdAt      Timestamp
   *
   * @apiError (Not Found 404)    NotFound     Article does not exist
   */
  .get(authorize(), controller.get)
  /**
   * @api {put} v1/articles/:articleId Replace Article
   * @apiDescription Replace the whole article document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} articleId   ArticleId
   *
   * @apiBody  {String{6..16448}}                text          Article text
   * @apiBody  {String{..128}}                   sourceUrl     SorceUrl of article
   * @apiBody  {String=article,tv,radio,other}   sourceType    Source type of article
   * @apiBody  {String=cz,sk,en}                 lang      Article language
   *
   * @apiSuccess (Created 201) {String}  _id            Article id
   * @apiSuccess (Created 201) {String}  addedBy        Id of user who added the article
   * @apiSuccess (Created 201) {String}  text           Text of article
   * @apiSuccess (Created 201) {String}  sourceUrl      Source url of article
   * @apiSuccess (Created 201) {String}  sourceType     Source type of article
   * @apiSuccess (Created 201) {String}  lang       Language of article
   * @apiSuccess (Created 201) {String}  nSaved         Number of saves
   * @apiSuccess (Created 201) {Date}    createdAt      Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized     Authenticated users (owners) can modify the data
   * @apiError (Not Found 404)    NotFound         Article does not exist
   */
  .put(authorize(), validate(replaceArticle), controller.replace)
  /**
   * @api {patch} v1/articles/:articleId Update Article
   * @apiDescription Update some fields of a article document
   * @apiVersion 1.0.0
   * @apiName UpdateArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} articleId   ArticleId
   *
   * @apiSuccess TODO
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     Article does not exist
   */
  .patch(authorize(), validate(updateArticle), controller.update)
  /**
   * @api {patch} v1/articles/:articleId Delete Article
   * @apiDescription Delete an article
   * @apiVersion 1.0.0
   * @apiName DeleteArticle
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} articleId   ArticleId
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
