const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/article.controller');
const { authorize } = require('../../middlewares/auth');
const {
  saveRoute,
} = require('../../validations/save.validation');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  /**
   * @api {post} v1/save Save Article
   * @apiDescription POST Add a newly saved article into list of liekd articles
   * @apiVersion 1.0.0
   * @apiName AddSavedArticle
   * @apiGroup SavedArticles
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {String}             [articleId]       Id of article to be saved
   *
   * @apiSuccess {String}  _id                  Claim id
   * @apiSuccess {String}  articleId     Id of rated object
   * @apiSuccess {String}  userId               Rating
   * @apiSuccess {Date}    createdAt            Timestamp
   *
   */
  .post(authorize(), validate(saveRoute), controller.saveByUser)
  /**
   * @api {delete} v1/save Unsave Article
   * @apiDescription DELETE Remove saved article from list of lieked articles
   * @apiVersion 1.0.0
   * @apiName RemoveSavedArticle
   * @apiGroup SavedArticles
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {String}             [articleId]       Id of article to be Unsaved
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   */
  .delete(authorize(), validate(saveRoute), controller.unsaveByUser);

module.exports = router;
