const express = require('express');
const validate = require('express-validation');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/hot.controller');
const {
  listHotUsers,
  listHotArticles,
  listHotClaims,
} = require('../../validations/hot.validation');

const router = express.Router({ mergeParams: true });

router
  .route('/users')
  /**
   * @api {get} v1/hot/users List of hottest users
   * @apiDescription Get a list of hottest users
   * @apiVersion 1.0.0
   * @apiName ListHottestUsers
   * @apiGroup Hot
   * @apiPermission user
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
   *
   * @apiSuccess {Object[]} List of hottest users.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(validate(listHotUsers), controller.hottestUsers);

router
  .route('/articles')
  /**
   * @api {get} v1/hot/articles List of hottest articles
   * @apiDescription Get a list of hottest articles
   * @apiVersion 1.0.0
   * @apiName ListHottestArticles
   * @apiGroup Hot
   * @apiPermission user
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
   *
   * @apiSuccess {Object[]} List of hottest articles.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), validate(listHotArticles), controller.hottestArticles);

router
  .route('/claims')
  /**
   * @api {get} v1/hot/claims List of hottest claims
   * @apiDescription Get a list of hottest claims
   * @apiVersion 1.0.0
   * @apiName ListHottestClaims
   * @apiGroup Hot
   * @apiPermission user
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
   *
   * @apiSuccess {Object[]} List of hottest claims.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(validate(listHotClaims), controller.hottestClaims);

module.exports = router;
