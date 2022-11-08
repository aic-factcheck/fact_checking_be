const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/review.controller');
const { authorize } = require('../../middlewares/auth');
const {
  listReviews,
  createReview,
  replaceReview,
  updateReview,
} = require('../../validations/review.validation');

const router = express.Router({ mergeParams: true });

/**
 * Load review when API with reviewId route parameter is hit
 */
router.param('reviewId', controller.loadReview);

router
  .route('/')
  /**
   * @api {get} v1/articles/:articleId/claims/:claimId/reviews List reviews
   * @apiDescription Get a list of Reviews
   * @apiVersion 1.0.0
   * @apiName ListReviews
   * @apiGroup Review
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
   *
   * @apiSuccess {Object[]} Review List of Reviews.
   */
  .get(validate(listReviews), controller.list)
  /**
   * @api {post} v1/articles/:articleId/claims/:claimId/reviews Create review
   * @apiDescription Create a new Review
   * @apiVersion 1.0.0
   * @apiName CreateReview
   * @apiGroup Review
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             text            Review's text
   * @apiParam  {String=positive,neutral,negative}   Vote of the review
   *
   * @apiSuccess {String}  id            Review's id
   * @apiSuccess {String}  text          Review's text
   * @apiSuccess {String}  vote          Vote - decision of reviewer
   * @apiSuccess {String}  userId        Reviewer's id
   * @apiSuccess {String}  claimId       Claim id
   * @apiSuccess {String}  articleId     ArticleId associated with selected claim
   * @apiSuccess {Number}  nUpvotes      Number of positive votes
   * @apiSuccess {array}    upvotes      List of user Ids who upvoted
   * @apiSuccess {Number}  nDownvotes    Number of negative votes
   * @apiSuccess {array}    downvotes    List of user Ids who downvoted
   * @apiSuccess {Date}    createdAt     Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createReview), controller.create);

router
  .route('/:reviewId')
  /**
   * @api {get} v1/articles/:articleId/claims/:claimId/reviews/:reviewId Get review
   * @apiDescription Get review information
   * @apiVersion 1.0.0
   * @apiName GetReview
   * @apiGroup Review
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess {String}  id            Review's id
   * @apiSuccess {String}  text          Review's text
   * @apiSuccess {String}  vote          Vote - decision of reviewer
   * @apiSuccess {String}  userId        Reviewer's id
   * @apiSuccess {String}  claimId       Claim id
   * @apiSuccess {Number}  nUpvotes      Number of positive votes
   * @apiSuccess {array}    upvotes      List of user Ids who upvoted
   * @apiSuccess {Number}  nDownvotes    Number of negative votes
   * @apiSuccess {array}    downvotes    List of user Ids who downvoted
   * @apiSuccess {Date}    createdAt     Timestamp
   *
   * @apiError (Not Found 404)    NotFound     Review does not exist
   */
  .get(controller.get)
  /**
   * @api {put} v1/articles/:articleId/claims/:claimId/reviews/:reviewId Replace review
   * @apiDescription Replace the whole review document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceReview
   * @apiGroup Review
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             text     Review's text
   * @apiParam  {String=positive,neutral,negative}   Vote of the review
   *
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     Review does not exist
   */
  .put(authorize(), validate(replaceReview), controller.replace)
  /**
   * @api {patch} v1/articles/:articleId/claims/:claimId/reviews/:reviewId Update review
   * @apiDescription Update some fields of a reviews document
   * @apiVersion 1.0.0
   * @apiName UpdateReview
   * @apiGroup Review
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             text            Review's text
   * @apiParam  {String=positive,neutral,negative}   Vote of the review
   *
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     Review does not exist
   */
  .patch(authorize(), validate(updateReview), controller.update)
  /**
   * @api {patch} v1/articles/:articleId/claims/:claimId/reviews/:reviewId Delete review
   * @apiDescription Delete a review
   * @apiVersion 1.0.0
   * @apiName DeleteReview
   * @apiGroup Review
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Not Found 404)    NotFound      Review does not exist
   */
  .delete(authorize(), controller.remove);

module.exports = router;
