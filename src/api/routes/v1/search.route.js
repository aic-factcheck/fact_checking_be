const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/search.controller');
const { authorize } = require('../../middlewares/auth');
const {
  searchClaims,
  searchArticles,
  searchUsers,
} = require('../../validations/search.validation');

const router = express.Router({ mergeParams: true });

router
  .route('/users')
  /**
   * @api {get} v1/search/users Search users
   * @apiDescription Get a list of users that contain query string
   * @apiVersion 1.0.0
   * @apiName SearchUsers
   * @apiGroup Search
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {String}             [text]     Key to be searched by
   *
   * @apiSuccess {Object[]} Users List of Users that matched the text search.
   *
   */
  .get(authorize(), validate(searchUsers), controller.searchUsers);

router
  .route('/claims')
  /**
   * @api {get} v1/search/claims Search claims
   * @apiDescription Get a list of claims that contain query string
   * @apiVersion 1.0.0
   * @apiName SearchClaim
   * @apiGroup Search
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {String}             [text]       Search text
   *
   * @apiSuccess {Object[]} Claims List of Claims that matched the text search.
   *
   */
  .get(authorize(), validate(searchClaims), controller.searchClaims);

router
  .route('/articles')
  /**
   * @api {get} v1/search/articles Search articles
   * @apiDescription Get a list of articles that contain query string
   * @apiVersion 1.0.0
   * @apiName SearchArticles
   * @apiGroup Search
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {String}             [text]       Search text
   *
   * @apiSuccess {Object[]} Articles List of Articles that matched the text search.
   *
   */
  .get(authorize(), validate(searchArticles), controller.searchArticles);

module.exports = router;
