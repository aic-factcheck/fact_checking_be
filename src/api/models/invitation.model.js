const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
const APIError = require('../errors/api-error');

/**
 * Invitation Schema
 * @private
 */
const invitationSchema = new mongoose.Schema({
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  invitedEmail: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    expires: '48h',
    default: Date.now,
  },
});

/**
 * Methods
 */
invitationSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'invitedBy', 'invitedEmail', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
invitationSchema.statics = {

  /**
   * Get Invitation
   *
   * @param {ObjectId} id - The objectId of invitation.
   * @returns {Promise<Invitation, APIError>}
   */
  async get(id) {
    let inv;

    if (mongoose.Types.ObjectId.isValid(id)) {
      inv = await this.findById(id).exec();
    }
    if (inv) {
      return inv;
    }

    throw new APIError({
      message: 'Invitation does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

/**
 * @typedef Invitation
 */
module.exports = mongoose.model('Invitation', invitationSchema);
