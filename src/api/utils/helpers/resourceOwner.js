const { _ } = require('lodash');
const httpStatus = require('http-status');
const APIError = require('../../errors/api-error');

/*
 * Performs validation over selected resource key
 * check whether resource.addeBy (userId) is the same as logged user id
 */
const checkIsOwnerOfResurce = async (resourceOwnerId, req) => {
  const { _id, role } = req.user;
  if (!_.isEqual(resourceOwnerId, _id) && role !== 'admin') {
    throw new APIError({
      status: httpStatus.FORBIDDEN,
      message: 'Forbidden to perform this action over selected resource.',
    });
  }
};

module.exports = checkIsOwnerOfResurce;
