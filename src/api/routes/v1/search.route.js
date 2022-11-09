const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/search.controller');
const { authorize } = require('../../middlewares/auth');
const {
  searchClaims,
  searchArticles,
} = require('../../validations/search.validation');

const router = express.Router({ mergeParams: true });

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
   * @apiParam  {String}             [text]       Search text
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
   * @apiName SearchClaim
   * @apiGroup Search
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             [text]       Search text
   *
   * @apiSuccess {Object[]} Articles List of Articles that matched the text search.
   *
   */
  .get(authorize(), validate(searchArticles), controller.searchArticles);

module.exports = router;
