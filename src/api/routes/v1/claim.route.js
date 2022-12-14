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
  addExistingClaim,
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
   * @apiSuccess {[].userReview} Logged user's review for claim.
   */
  .get(authorize(), validate(listClaims), controller.list)
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
   * @apiParam  {Number}             claimId  Iff adding existing claim to article
   *
   * @apiSuccess (Created 201) {String}  text         Claim's text
   * @apiSuccess (Created 201) {String}  priority     Claim's priority
   * @apiSuccess (Created 201) {String}  addedBy      User id who added
   * @apiSuccess (Created 201) {String}  articleId    Claim id
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
   * @apiSuccess {Object}  addedBy      User object  who added
   * @apiSuccess {String}  articleId    Claim id
   * @apiSuccess {String[]}  links    Array of links
   * @apiSuccess {String}  language       Language of article
   * @apiSuccess {Date}    createdAt    Timestamp
   * @apiSuccess {Object}  userReview    Object containing logged user review
   * @apiSuccess {String}  userReview.vote    Logged user review vote - positive/neutral/negative
   *
   * @apiError (Not Found 404)    NotFound     Claims does not exist
   */
  .get(authorize(), controller.get)
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
  .delete(authorize(), controller.remove)
  /**
   * @api {put} v1/articles/:articleId/claims/:id Add articleId to claim
   * @apiDescription Adding existing claim to article
   * @apiVersion 1.0.0
   * @apiName AddExistingClaim
   * @apiGroup Claim
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     Claims does not exist
   */
  .post(authorize(), validate(addExistingClaim), controller.addExistingClaim);

// add nested routes - review routes
router.use('/:claimId/reviews', reviewRoutes);

module.exports = router;
