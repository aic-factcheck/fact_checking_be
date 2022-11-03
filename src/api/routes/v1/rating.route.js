const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/rating.controller');
const { authorize } = require('../../middlewares/auth');
const {
  voteRoute,
} = require('../../validations/rating.validation');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  /**
   * @api {post} v1/vote Create vote
   * @apiDescription POST Create a new rating -> vote for user,article or claim
   * @apiVersion 1.0.0
   * @apiName CreateVote
   * @apiGroup Vote
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             [articleId]       Id
   * @apiParam  {String}             [claimId]         Id
   * @apiParam  {String}             [userId]          Id
   * @apiParam  {Number{-1-10}}      [rating]          Value of the actual vote/rating
   * @apiParam  {String}             [text]            Text of the rating
   *
   * @apiSuccess {String}  _id       Claim id
   * @apiSuccess {String}  articleId/claimId/userId    Id of rated object
   * @apiSuccess {Date}    createdAt     Timestamp
   *
   */
  .post(authorize(), validate(voteRoute), controller.voteFor);

module.exports = router;
