const httpStatus = require('http-status');
const { _ } = require('lodash');
const Invitation = require('../models/invitation.model');
const emailProvider = require('../services/emails/emailProvider');

/**
 * Load invitation and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const invitation = await Invitation.get(id);
    req.locals = _.assign(req.locals, { invitation });
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get Invitation
 * @public
 */
exports.get = (req, res) => {
  res.json(req.locals.invitation.transform());
};

/**
 * Create new Invitation
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const invitation = new Invitation(_.assign(req.body, {
      invitedBy: req.user.id,
    }));
    // generate verification code
    invitation.verificationCode = Math.floor(1000 + Math.random() * 9000);

    const savedInvitation = await invitation.save();
    emailProvider.sendInvitationRequest(savedInvitation, req.user, invitation.verificationCode);

    res.status(httpStatus.CREATED);
    res.json(savedInvitation.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Get Invitation list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const { page, perPage } = req.query;
    const invitations = await Invitation.find().limit(perPage).skip(perPage * (page - 1));
    const transInvitations = invitations.map((x) => x.transform());
    res.json(transInvitations);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete invitation
 * @public
 */
exports.remove = (req, res, next) => {
  const { invitation } = req.locals;

  invitation.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e) => next(e));
};
