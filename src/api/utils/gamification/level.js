const { _ } = require('lodash');
const Experience = require('../../models/experience.model');

// const constA = 8.7; const constB = -45; const constC = 47;
// const level = Math.max(Math.floor(constA * Math.log(experience + constC) + constB), 1);

const constC = 0.25;

exports.getLastExp = async (userId) => {
  const lastExp = await Experience.get(userId);
  if (_.isNil(lastExp) || _.isNil(lastExp.exp)) return { exp: 0 };
  return lastExp;
};

exports.getLevel = (exp) => {
  const level = Math.floor(constC * Math.sqrt(exp));
  return level;
};

exports.getNextLevelExp = (level) => {
  const exp = ((level + 1) / constC) ** 2;
  return exp;
};
