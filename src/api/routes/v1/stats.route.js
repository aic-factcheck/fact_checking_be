const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/stats.controller');
const { authorize } = require('../../middlewares/auth');
const {
  userStats,
} = require('../../validations/stats.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} v1/stats User statistics
   * @apiDescription GET statistics about currently logged in user
   * @apiVersion 1.0.0
   * @apiName GetUserStats
   * @apiGroup Statistics
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {String} [userId=loggedUser]    UserId to be search for stats
   *
   * @apiSuccess {Object}  user        Object of user
   * @apiSuccess {String}  articles.total  Total number of user's articles
   * @apiSuccess {String}  articles.nSaved  Total number of people who saved article of user
   * @apiSuccess {String}  claims.total  Total number of user's claims
   * @apiSuccess {String}  claims.nNegativeVotes  Total number of negative votes for all claims
   * @apiSuccess {String}  claims.nPositiveVotes  Total number of postiive votes for all claims
   * @apiSuccess {String}  reviews.total  Total number of user's reviews
   * @apiSuccess {String}  reviews.nNegativeVotes  Total number of negative votes for all reviews
   * @apiSuccess {String}  reviews.nPositiveVotes  Total number of postiive votes for all reviews
   * @apiSuccess {String}  reviews.nNeutralVotes  Total number of neutral votes for all reviews
   *
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "user": { firstName: "Rastislav", lastName: "Butora", userId: "uuid", email: "rb@c.c" },
   *       "articles": { "total": 51, "nSaved": 4},
   *       "claims": { "total" : 421, "nNegativeVotes": 21, "nPositiveVotes": 120 },
   *       "reviews": { "total" : 421, "nNegativeVotes": 21,
   *         "nPositiveVotes":120", nNeutralVotes": 120 },
   *     }
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized     Authenticated users can access the data
   * @apiError (Not Found 404)    NotFound         User does not exist
   */
  .get(authorize(), validate(userStats), controller.currentlyLogged);

module.exports = router;
