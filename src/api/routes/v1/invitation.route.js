const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/invitation.controller');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');
const {
  listInvitations,
  createInvitation,
} = require('../../validations/invitation.validation');

const router = express.Router({ mergeParams: true });

/**
 * Load invitation when API with invitationId route parameter is hit
 */
router.param('invitationId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/users/:userId/invitations List invitations
   * @apiDescription Get a list of invitations
   * @apiVersion 1.0.0
   * @apiName ListInvitations
   * @apiGroup Invitation
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  TODO
   *
   * @apiSuccess {Object[]} Invitations List of Invitations.
   *
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   */
  .get(authorize(LOGGED_USER), validate(listInvitations), controller.list)
  /**
   * @api {post} v1/users/:userId/invitations Create Invitation
   * @apiDescription Create a new Invitation
   * @apiVersion 1.0.0
   * @apiName CreateInvitation
   * @apiGroup Invitation
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  TODO
   *
   * @apiSuccess TODO
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(LOGGED_USER), validate(createInvitation), controller.create);

router
  .route('/:invitationId')
  /**
   * @api {get} v1/users/:userId/invitations/:invitationId Get Invitation
   * @apiDescription Get Invitation information
   * @apiVersion 1.0.0
   * @apiName GetInvitation
   * @apiGroup Invitation
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess TODO
   *
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Invitation does not exist
   */
  .get(authorize(LOGGED_USER), controller.get)
  /**
   * @api {patch} v1/users/:userId/invitations/:invitationId Delete Invitation
   * @apiDescription Delete an Invitation
   * @apiVersion 1.0.0
   * @apiName DeleteInvitation
   * @apiGroup Invitation
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound      Invitation does not exist
   */
  .delete(authorize(LOGGED_USER), controller.remove);

module.exports = router;
