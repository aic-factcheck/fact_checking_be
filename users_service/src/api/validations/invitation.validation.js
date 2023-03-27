const Joi = require('joi');
// const Invitation = require('../models/invitation.model');

module.exports = {

  // GET /v1/users/:userId/invitations
  listInvitations: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },

  // POST /v1/users/:userId/invitations
  createInvitation: {
    body: {
      invitedEmail: Joi.string().email().required(),
    },
  },
};
