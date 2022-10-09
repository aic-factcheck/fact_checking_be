const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/claim.controller');
const reviewRoutes = require('./review.route');
const { authorize } = require('../../middlewares/auth');
const {
  listClaims,
  createClaim,
  replaceClaim,
  updateClaim,
} = require('../../validations/claim.validation');

const router = express.Router({ mergeParams: true });

/**
 * Load claim when API with claimId route parameter is hit
 */
router.param('claimId', controller.loadClaim);

router
  .route('/')
  /**
   * @api {get} v1/articles/:articleId/claims List Claims
   * @apiDescription Get a list of Claims
   * @apiVersion 1.0.0
   * @apiName ListClaims
   * @apiGroup Claim
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
   *
   * @apiSuccess {Object[]} Claims List of Claims.
   */
  .get(validate(listClaims), controller.list)
  /**
   * @api {post} v1/articles/:articleId/claims Create Claim
   * @apiDescription Create a new Claims
   * @apiVersion 1.0.0
   * @apiName CreateClaims
   * @apiGroup Claim
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             text      Claims's text
   * @apiParam  {Number}             priority  Priority of claim
   *
   * @apiSuccess (Created 201) {String}  text         Claim's text
   * @apiSuccess (Created 201) {String}  priority     Claim's priority
   * @apiSuccess (Created 201) {String}  addedBy      User id who added
   * @apiSuccess (Created 201) {String}  articleId    Claim id
   * @apiSuccess (Created 201) {Number}  nPositiveVotes    Number of positive votes
   * @apiSuccess (Created 201) {array}  positiveVotes    positive votes - user Ids
   * @apiSuccess (Created 201) {Number}  nNeutralVotes    Number of neutral votes
   * @apiSuccess (Created 201) {array}  neutralVotes    neutral votes - user Ids
   * @apiSuccess (Created 201) {Number}  nNegativeVotes    Number of negative votes
   * @apiSuccess (Created 201) {array}  negativeVotes    negative votes - user Ids
   * @apiSuccess (Created 201) {Date}    createdAt    Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createClaim), controller.create);

router
  .route('/:claimId')
  /**
   * @api {get} v1/articles/:articleId/claims/:id Get Claim
   * @apiDescription Get Claims information
   * @apiVersion 1.0.0
   * @apiName GetClaims
   * @apiGroup Claim
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess {String}  id         Claim's id
   * @apiSuccess {String}  text         Claim's text
   * @apiSuccess {String}  priority     Claim's priority
   * @apiSuccess {String}  addedBy      User id who added
   * @apiSuccess {String}  articleId    Claim id
   * @apiSuccess {Number}  nPositiveVotes    Number of positive votes
   * @apiSuccess {array}  positiveVotes    positive votes - user Ids
   * @apiSuccess {Number}  nNeutralVotes    Number of neutral votes
   * @apiSuccess {array}  neutralVotes    neutral votes - user Ids
   * @apiSuccess {Number}  nNegativeVotes    Number of negative votes
   * @apiSuccess {array}  negativeVotes    negative votes - user Ids
   * @apiSuccess {Date}    createdAt    Timestamp
   *
   * @apiError (Not Found 404)    NotFound     Claims does not exist
   */
  .get(controller.get)
  /**
   * @api {put} v1/articles/:articleId/claims/:id Replace Claim
   * @apiDescription Replace the whole Claims document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceClaims
   * @apiGroup Claim
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             text     Claims's text
   *
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     Claims does not exist
   */
  .put(authorize(), validate(replaceClaim), controller.replace)
  /**
   * @api {patch} v1/articles/:articleId/claims/:id Update Claim
   * @apiDescription Update some fields of a Claims document
   * @apiVersion 1.0.0
   * @apiName UpdateClaims
   * @apiGroup Claim
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             text     Claims's text
   *
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     Claims does not exist
   */
  .patch(authorize(), validate(updateClaim), controller.update)
  /**
   * @api {patch} v1/articles/:articleId/claims/:id Delete Claim
   * @apiDescription Delete an Claims
   * @apiVersion 1.0.0
   * @apiName DeleteClaims
   * @apiGroup Claim
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Not Found 404)    NotFound      Claims does not exist
   */
  .delete(authorize(), controller.remove);

// add nested routes - review routes
router.use('/:claimId/reviews', reviewRoutes);

module.exports = router;
