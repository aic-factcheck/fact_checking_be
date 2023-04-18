const express = require('express');
const controller = require('../../controllers/game.controller');
const { authorize } = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/profile/info')
  /**
   * @api {get} v1/game/level GET my current level/experience info
   * @apiDescription Get information about current user - his level and experience
   * @apiVersion 1.0.0
   * @apiName GetExpLevelInfo
   * @apiGroup Game
   * @apiPermission user
   *
   * @apiSuccess {String}  userId            Current user id
   * @apiSuccess {Number}  level            Current user's level
   * @apiSuccess {Number}  exp              Current user's experience
   * @apiSuccess {Number}  nextLevelExp     Next level experience boundary
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), controller.getLevelInfo);

module.exports = router;
