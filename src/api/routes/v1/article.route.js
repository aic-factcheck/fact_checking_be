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
   * @apiParam  {Number{1-}}         [page=1]     List page (optional)
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page (optional)
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
   * @apiParam  {String{6..16448}}                text          Article text
   * @apiParam  {String{..128}}                   sourceUrl     SorceUrl of article
   * @apiParam  {String=article,tv,radio,other}   sourceType    Source type of article
   * @apiParam  {String=cz,sk,en}                 language      Article language
   *
   * @apiSuccess (Created 201) {String}  _id            Article id
   * @apiSuccess (Created 201) {String}  addedBy        Id of user who added the article
   * @apiSuccess (Created 201) {String}  text           Text of article
   * @apiSuccess (Created 201) {String}  sourceUrl      Source url of article
   * @apiSuccess (Created 201) {String}  sourceType     Source type of article
   * @apiSuccess (Created 201) {String}  language       Language of article
   * @apiSuccess (Created 201) {Date}    createdAt      Timestamp
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
   * @apiSuccess {String}  _id            Article's id
   * @apiSuccess {String}  addedBy        Id of user who added the article
   * @apiSuccess {String}  text           Text of article
   * @apiSuccess {String}  sourceUrl      Source url of article
   * @apiSuccess {String}  sourceType     Source type of article
   * @apiSuccess {String}  language       Language of article
   * @apiSuccess (Created 201) {Number}  nPositiveVotes    Number of positive votes
   * @apiSuccess (Created 201) {array}  positiveVotes    positive votes - user Ids
   * @apiSuccess (Created 201) {Number}  nNegativeVotes    Number of negative votes
   * @apiSuccess (Created 201) {array}  negativeVotes    negative votes - user Ids
   * @apiSuccess {Date}    createdAt      Timestamp
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
   * @apiParam  {String{6..16448}}                text          Article text
   * @apiParam  {String{..128}}                   sourceUrl     SorceUrl of article
   * @apiParam  {String=article,tv,radio,other}   sourceType    Source type of article
   * @apiParam  {String=cz,sk,en}                 language      Article language
   *
   * @apiSuccess (Created 201) {String}  _id            Article id
   * @apiSuccess (Created 201) {String}  addedBy        Id of user who added the article
   * @apiSuccess (Created 201) {String}  text           Text of article
   * @apiSuccess (Created 201) {String}  sourceUrl      Source url of article
   * @apiSuccess (Created 201) {String}  sourceType     Source type of article
   * @apiSuccess (Created 201) {String}  language       Language of article
   * @apiSuccess (Created 201) {Date}    createdAt      Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized     Authenticated users (owners) can modify the data
   * @apiError (Not Found 404)    NotFound         Article does not exist
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
