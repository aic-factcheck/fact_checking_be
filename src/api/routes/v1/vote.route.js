const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/vote.controller');
const { authorize } = require('../../middlewares/auth');
const {
  voteRoute,
} = require('../../validations/vote.validation');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  /**
   * @api {post} v1/vote Create vote
   * @apiDescription POST Create a new vote -> vote for claim or review
   * @apiVersion 1.0.0
   * @apiName CreateVote
   * @apiGroup Vote
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {String}             [claimId]       claimId to be voted for
   *
   * @apiParam  {String}             [articleId]     articleId to be voted for
   * @apiParam  {String}             [reviewId]      reviewId to be voted for
   * @apiParam  {String}             [userId]        userId to be voted for
   *
   * @apiBody  {Number{-1, 0, 1}}   [rating]          Value of the actual vote
   * @apiBody  {String}             [text]            Text of the vote - optional
   *
   * @apiSuccess {String}  _id                  Claim id
   * @apiSuccess {String}  claimId/reviewId/articleId     Id of rated object
   * @apiSuccess {String}  rating               Rating
   * @apiSuccess {Date}    createdAt            Timestamp
   *
   */
  .post(authorize(), validate(voteRoute), controller.voteFor);

module.exports = router;
