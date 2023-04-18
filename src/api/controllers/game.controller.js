// const { _ } = require('lodash');
const { getNextLevelExp, getLastExp } = require('../utils/gamification/level');

/**
 * Get level/exp info about current user
 * @public
 */
exports.getLevelInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lastExp = await getLastExp(userId);

    res.json({
      userId,
      exp: lastExp.exp,
      level: req.user.level,
      nextLevelExp: getNextLevelExp(req.user.level),
    });
  } catch (error) {
    next(error);
  }
};
