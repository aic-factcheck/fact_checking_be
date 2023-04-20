const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const invitationRoutes = require('./invitation.route');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const {
  listUsers,
  createUser,
  replaceUser,
  updateUser,
  listUsersArticles,
  listUsersClaims,
  listUsersReviews,
} = require('../../validations/user.validation');

const router = express.Router({ mergeParams: true });

/**
 * Load user when API with userId route parameter is hit
 */
router.param('userId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/users List Users
   * @apiDescription Get a list of users
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiQuery  {Number{1-}}         [page=1]     List page
   * @apiQuery  {Number{1-100}}      [perPage=1]  Users per page
   * @apiBody  {String}             [name]       User's name
   * @apiBody  {String}             [email]      User's email
   * @apiBody  {String=user,admin}  [role]       User's role
   *
   * @apiSuccess {Object[]} users List of users.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), validate(listUsers), controller.list)
  /**
   * @api {post} v1/users Create User
   * @apiDescription Create a new user
   * @apiVersion 1.0.0
   * @apiName CreateUser
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiBody  {String}             email     User's email
   * @apiBody  {String{6..128}}     password  User's password
   * @apiBody  {String{..128}}      [name]    User's name
   * @apiBody  {String=user,admin}  [role]    User's role
   *
   * @apiSuccess (Created 201) {String}  id         User's id
   * @apiSuccess (Created 201) {String}  name       User's name
   * @apiSuccess (Created 201) {String}  email      User's email
   * @apiSuccess (Created 201) {String}  role       User's role
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(ADMIN), validate(createUser), controller.create);

router
  .route('/profile')
  /**
   * @api {get} v1/users/profile User Profile
   * @apiDescription Get logged in user profile information
   * @apiVersion 1.0.0
   * @apiName UserProfile
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess {Number}  nArticles  Number of user's articles
   * @apiSuccess {Number}  nClaims    Number of user's claims
   * @apiSuccess {Number}  nReviews   Number of user's reviews
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Users can access the data
   */
  .get(authorize(), controller.loggedIn);

router
  .route('/:userId')
  /**
   * @api {get} v1/users/:userId Get User
   * @apiDescription Get user information
   * @apiVersion 1.0.0
   * @apiName GetUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} userId  User's id
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .get(authorize(), controller.get)
  /**
   * @api {put} v1/users/:userId Replace User
   * @apiDescription Replace the whole user document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} userId  User's id
   *
   * @apiBody  {String}             email     User's email
   * @apiBody  {String{6..128}}     password  User's password
   * @apiBody  {String{..128}}      [name]    User's name
   * @apiBody  {String=user,admin}  [role]    User's role
   * @apiBody  {String}             firstName  User's first name
   * @apiBody  {String}             lastName   User's last name
   * (You must be an admin to change the user's role)
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess {String}  firstName  User's first name
   * @apiSuccess {String}  lastName   User's last name
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .put(authorize(LOGGED_USER), validate(replaceUser), controller.replace)
  /**
   * @api {patch} v1/users/:userId Update User
   * @apiDescription Update some fields of a user document
   * @apiVersion 1.0.0
   * @apiName UpdateUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} userId  User's id
   *
   * @apiBody  {String}             email     User's email
   * @apiBody  {String{6..128}}     password  User's password
   * @apiBody  {String{..128}}      [name]    User's name
   * @apiBody  {String=user,admin}  [role]    User's role
   * @apiBody  {String}             firstName  User's first name
   * @apiBody  {String}             lastName   User's last name
   * (You must be an admin to change the user's role)
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess {String}  firstName  User's first name
   * @apiSuccess {String}  lastName   User's last name
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .patch(authorize(LOGGED_USER), validate(updateUser), controller.update)
  /**
   * @api {patch} v1/users/:userId Delete User
   * @apiDescription Delete a user
   * @apiVersion 1.0.0
   * @apiName DeleteUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} userId  User's id
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only user with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      User does not exist
   */
  .delete(authorize(ADMIN), controller.remove);

// include nested - Claim routes
router.use('/:userId/invitations', invitationRoutes);

// User's article
router
  .route('/:userId/articles')
  /**
   * @api {get} v1/users/:userId/articles Get list of user's articles
   * @apiDescription Get list of user's articles
   * @apiVersion 1.0.0
   * @apiName GetUsersArticles
   * @apiGroup Article
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} userId  User's id
   *
   * @apiQuery  {Number{1-}}         [page=1]     List page
   * @apiQuery  {Number{1-100}}      [perPage=1]  Articles per page
   *
   * @apiSuccess {Object[]} user's List of articles.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), validate(listUsersArticles), controller.getUsersArticles);

// User's claims
router
  .route('/:userId/claims')
  /**
   * @api {get} v1/users/:userId/articles Get list of user's claims
   * @apiDescription Get list of user's claims
   * @apiVersion 1.0.0
   * @apiName GetUsersClaims
   * @apiGroup Claim
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} userId  User's id
   *
   * @apiQuery  {Number{1-}}         [page=1]     List page
   * @apiQuery  {Number{1-100}}      [perPage=1]  Claims per page
   *
   * @apiSuccess {Object[]} user's List of users.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), validate(listUsersClaims), controller.getUsersClaims);

router
  .route('/:userId/reviews')
  /**
   * @api {get} v1/users/:userId/reviews Get list of user's reviews
   * @apiDescription Get list of user's reviews
   * @apiVersion 1.0.0
   * @apiName GetUsersReview
   * @apiGroup Review
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam {String} userId  User's id
   *
   * @apiQuery  {Number{1-}}         [page=1]     List page
   * @apiQuery  {Number{1-100}}      [perPage=1]  Reviews per page
   *
   * @apiSuccess {Object[]} user's List of reviews.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), validate(listUsersReviews), controller.getUsersReviews);

module.exports = router;
