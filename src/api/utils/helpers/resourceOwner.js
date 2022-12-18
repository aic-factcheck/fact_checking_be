const { _ } = require('lodash');
const httpStatus = require('http-status');
const APIError = require('../../errors/api-error');

const User = require('../../models/user.model');
/*
 * Performs validation over selected resource key
 * check whether resource.addeBy (userId) is the same as logged user id
 */
exports.checkIsOwnerOfResurce = async (resourceOwnerId, req) => {
  const { _id, role } = req.user;
  if (!_.isEqual(resourceOwnerId, _id) && role !== 'admin') {
    throw new APIError({
      status: httpStatus.FORBIDDEN,
      message: 'Forbidden to perform this action over selected resource.',
    });
  }
};

/*
 * Get User (User that added resource)
 * return only basic fields
 */
exports.loadUserTransformed = async (addedBy) => {
  const user = await User.findOne({ _id: addedBy }, '_id firstName lastName email');
  return user;
};
